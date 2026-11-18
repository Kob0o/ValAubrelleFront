import { describe, expect, it } from "vitest";

import {
  hasSessionCookie,
  isPublicPath,
  loginRedirectPath,
  shouldRedirectToLogin,
} from "@/lib/auth/proxy-auth";

describe("proxy-auth", () => {
  it("reconnaît les chemins publics", () => {
    expect(isPublicPath("/")).toBe(true);
    expect(isPublicPath("/login")).toBe(true);
    expect(isPublicPath("/password-reset/confirm")).toBe(true);
    expect(isPublicPath("/dev/ui")).toBe(true);
    expect(isPublicPath("/explorer")).toBe(false);
  });

  it("ne redirige pas en mode mock", () => {
    expect(
      shouldRedirectToLogin({
        pathname: "/explorer",
        hasSessionCookie: false,
        mockMode: true,
      }),
    ).toBe(false);
  });

  it("redirige si cookie absent hors chemin public", () => {
    expect(
      shouldRedirectToLogin({
        pathname: "/explorer",
        hasSessionCookie: false,
        mockMode: false,
      }),
    ).toBe(true);
  });

  it("ne redirige pas si cookie présent", () => {
    expect(
      shouldRedirectToLogin({
        pathname: "/explorer",
        hasSessionCookie: true,
        mockMode: false,
      }),
    ).toBe(false);
  });

  it("construit /login?returnUrl=", () => {
    expect(loginRedirectPath("/explorer", "?year=2024")).toBe(
      `/login?returnUrl=${encodeURIComponent("/explorer?year=2024")}`,
    );
  });

  it("détecte la présence du cookie de session", () => {
    expect(
      hasSessionCookie({
        get: (name) => (name === "session" ? { value: "abc" } : undefined),
      }),
    ).toBe(true);
    expect(
      hasSessionCookie({
        get: () => undefined,
      }),
    ).toBe(false);
  });
});
