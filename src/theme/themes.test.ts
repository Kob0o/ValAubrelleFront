import { describe, expect, it } from "vitest";

import { charter } from "@/theme/tokens";
import { ACTIVE_THEME, getActiveTheme, themes } from "@/theme/themes";

describe("thème actif", () => {
  it("conserve les six références hexadécimales du PDF 2026", () => {
    expect({ primary: charter.primary, primaryStrong: charter.primaryStrong, accent: charter.accent, surfaceAlt: charter.surfaceAlt, text: charter.text, textMuted: charter.textMuted }).toEqual({ primary: "#2E7D5B", primaryStrong: "#1F5C42", accent: "#8CC63F", surfaceAlt: "#F1F6F2", text: "#24302B", textMuted: "#5D6B64" });
  });
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
