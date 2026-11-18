import { act, renderHook, waitFor } from "@testing-library/react";
import type { ReactNode } from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { AuthProvider, useAuth } from "@/hooks/use-auth";
import {
  createApiClient,
  resetApiClientForTests,
  unwrapApiResult,
} from "@/lib/api/client";
import { clearSessionUser, writeSessionUser } from "@/lib/auth/session-source";
import { MOCK_PASSWORD, mockUser } from "@/mocks/auth";

const replace = vi.fn();
const push = vi.fn();

vi.mock("next/navigation", () => ({
  useRouter: () => ({ replace, push, prefetch: vi.fn(), back: vi.fn() }),
}));

const MOCK_BASE_URL = "http://mock.local/api/v1";

function wrapper({ children }: { children: ReactNode }) {
  return <AuthProvider>{children}</AuthProvider>;
}

describe("useAuth", () => {
  beforeEach(() => {
    vi.stubEnv("NEXT_PUBLIC_API_MOCK", "true");
    vi.stubEnv("NEXT_PUBLIC_API_BASE_URL", MOCK_BASE_URL);
    resetApiClientForTests();
    clearSessionUser();
    replace.mockReset();
    push.mockReset();
  });

  afterEach(() => {
    clearSessionUser();
    vi.unstubAllEnvs();
    resetApiClientForTests();
  });

  it("status unknown sans session en sessionStorage", async () => {
    const { result } = renderHook(() => useAuth(), { wrapper });
    await waitFor(() => {
      expect(result.current.status).toBe("unknown");
    });
    expect(result.current.user).toBeNull();
  });

  it("status authenticated après relecture sessionStorage", async () => {
    writeSessionUser(mockUser);
    const { result } = renderHook(() => useAuth(), { wrapper });
    await waitFor(() => {
      expect(result.current.status).toBe("authenticated");
    });
    expect(result.current.user).toEqual(mockUser);
  });

  it("login authentifie, persiste et redirige vers redirectUrl", async () => {
    const { result } = renderHook(() => useAuth(), { wrapper });

    await act(async () => {
      await result.current.login({
        email: mockUser.email,
        password: MOCK_PASSWORD,
        returnUrl: "/explorer",
      });
    });

    expect(result.current.status).toBe("authenticated");
    expect(result.current.user).toEqual(mockUser);
    expect(push).toHaveBeenCalledWith("/explorer");
  });

  it("INVALID_CREDENTIALS ne passe pas en expired", async () => {
    const { result } = renderHook(() => useAuth(), { wrapper });

    await act(async () => {
      try {
        await result.current.login({
          email: "bad@example.com",
          password: "nope",
        });
      } catch {
        // attendu
      }
    });

    expect(result.current.status).toBe("unknown");
    expect(replace).not.toHaveBeenCalled();
  });

  it("status expired + redirect /login?returnUrl= sur 401 UNAUTHENTICATED", async () => {
    writeSessionUser(mockUser);
    const { result } = renderHook(() => useAuth(), { wrapper });
    await waitFor(() => {
      expect(result.current.status).toBe("authenticated");
    });

    await act(async () => {
      try {
        await unwrapApiResult(
          createApiClient().GET("/municipalities/{municipalityCode}", {
            params: {
              path: { municipalityCode: "99999" },
              query: { year: 2024 },
            },
          }),
        );
      } catch {
        // 404 — pas une expiration
      }
    });

    // Force un 401 UNAUTHENTICATED via markExpired (handler branché)
    await act(async () => {
      result.current.markExpired("/explorer");
    });

    expect(result.current.status).toBe("expired");
    expect(result.current.user).toBeNull();
    expect(replace).toHaveBeenCalledWith(
      `/login?returnUrl=${encodeURIComponent("/explorer")}`,
    );
  });

  it("un 401 UNAUTHENTICATED du client notifie AuthProvider", async () => {
    writeSessionUser(mockUser);
    const { result } = renderHook(() => useAuth(), { wrapper });
    await waitFor(() => {
      expect(result.current.status).toBe("authenticated");
    });

    // Réponse mock dédiée : on simule via fetch global hors mock-fetch auth
    vi.stubEnv("NEXT_PUBLIC_API_MOCK", "false");
    resetApiClientForTests();
    vi.stubGlobal(
      "fetch",
      vi.fn(async () =>
        new Response(JSON.stringify({ code: "UNAUTHENTICATED" }), {
          status: 401,
          headers: { "Content-Type": "application/json" },
        }),
      ),
    );

    await act(async () => {
      try {
        await unwrapApiResult(
          createApiClient().GET("/municipalities/{municipalityCode}", {
            params: {
              path: { municipalityCode: "59230" },
              query: { year: 2024 },
            },
          }),
        );
      } catch {
        // attendu
      }
    });

    await waitFor(() => {
      expect(result.current.status).toBe("expired");
    });
    expect(replace).toHaveBeenCalled();
    const redirect = String(replace.mock.calls[0]?.[0] ?? "");
    expect(redirect.startsWith("/login?returnUrl=")).toBe(true);

    vi.unstubAllGlobals();
  });

  it("hasRole respecte le rôle et visitor sans user", async () => {
    writeSessionUser(mockUser);
    const { result } = renderHook(() => useAuth(), { wrapper });
    await waitFor(() => {
      expect(result.current.status).toBe("authenticated");
    });
    expect(result.current.hasRole("mayor")).toBe(true);
    expect(result.current.hasRole("admin")).toBe(false);

    await act(async () => {
      result.current.markExpired("/");
    });
    expect(result.current.hasRole("visitor")).toBe(true);
    expect(result.current.hasRole("mayor")).toBe(false);
  });

  it("logout vide la session locale", async () => {
    writeSessionUser(mockUser);
    const { result } = renderHook(() => useAuth(), { wrapper });
    await waitFor(() => {
      expect(result.current.status).toBe("authenticated");
    });

    // repasser en mock pour DELETE /auth/session
    vi.stubEnv("NEXT_PUBLIC_API_MOCK", "true");
    resetApiClientForTests();

    await act(async () => {
      await result.current.logout();
    });

    expect(result.current.status).toBe("unknown");
    expect(result.current.user).toBeNull();
  });
});
