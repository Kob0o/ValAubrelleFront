import { describe, expect, it } from "vitest";

import { isDevPagesEnabled } from "@/lib/dev-pages";

const env = (vars: Record<string, string>) => vars as unknown as NodeJS.ProcessEnv;

describe("isDevPagesEnabled", () => {
  it("affiche les pages de démo hors production", () => {
    expect(isDevPagesEnabled(env({ NODE_ENV: "development" }))).toBe(true);
    expect(isDevPagesEnabled(env({ NODE_ENV: "test" }))).toBe(true);
  });

  it("les masque en production", () => {
    expect(isDevPagesEnabled(env({ NODE_ENV: "production" }))).toBe(false);
    expect(
      isDevPagesEnabled(env({ NODE_ENV: "production", ENABLE_DEV_PAGES: "1" })),
    ).toBe(false);
  });

  it("les réactive en production avec ENABLE_DEV_PAGES=true", () => {
    expect(
      isDevPagesEnabled(env({ NODE_ENV: "production", ENABLE_DEV_PAGES: "true" })),
    ).toBe(true);
  });
});
