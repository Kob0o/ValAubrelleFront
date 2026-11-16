import { describe, expect, it } from "vitest";

import { charter } from "@/theme/tokens";
import { ACTIVE_THEME, getActiveTheme, themes } from "@/theme/themes";

describe("thème actif", () => {
  it("expose les six couleurs imposées par la charte", () => {
    const variables = getActiveTheme().cssVariables;

    expect(variables["--color-primary"]).toBe(charter.primary);
    expect(variables["--color-primary-strong"]).toBe(charter.primaryStrong);
    expect(variables["--color-text"]).toBe(charter.text);
    expect(variables["--color-text-muted"]).toBe(charter.textMuted);
    expect(variables["--color-surface-alt"]).toBe(charter.surfaceAlt);
    expect(variables["--color-accent"]).toBe(charter.accent);
  });

  it("branche les variables shadcn sur le thème, pas sur des couleurs en dur des composants", () => {
    const variables = themes[ACTIVE_THEME].cssVariables;

    expect(variables["--primary"]).toBe(charter.primary);
    expect(variables["--foreground"]).toBe(charter.text);
    expect(variables["--muted-foreground"]).toBe(charter.textMuted);
    expect(variables["--secondary"]).toBe(charter.surfaceAlt);
    expect(variables["--ring"]).toBe(charter.primaryStrong);
  });
});
