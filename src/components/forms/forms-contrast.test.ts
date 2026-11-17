import { describe, expect, it } from "vitest";

import { contrastRatio, TEXT_CONTRAST_MINIMUM } from "@/theme/contrast";
import { charter } from "@/theme/tokens";
import { getActiveTheme } from "@/theme/themes";

/** WCAG 1.4.11 / RGAA 3.3 : composants d'interface et indicateurs de focus. */
const UI_CONTRAST_MINIMUM = 3;

/** Variables du thème réellement utilisées par les primitives des champs. */
const theme = getActiveTheme().cssVariables;
const v = (name: string) => theme[name];

describe("contraste des champs de formulaire (variables du thème)", () => {
  it.each([
    ["libellé et saisie (--foreground) sur --background", "--foreground", "--background"],
    ["aide et placeholder (--muted-foreground) sur --background", "--muted-foreground", "--background"],
    ["message d'erreur (--destructive) sur --background", "--destructive", "--background"],
    ["texte désactivé (--muted-foreground) sur --muted", "--muted-foreground", "--muted"],
    ["texte lecture seule (--foreground) sur --muted", "--foreground", "--muted"],
    ["option active (--accent-foreground) sur --accent", "--accent-foreground", "--accent"],
    ["badge « Obligatoire » (--secondary-foreground) sur --secondary", "--secondary-foreground", "--secondary"],
    ["infobulle d'aide (--background) sur --foreground", "--background", "--foreground"],
    ["icône d'aide et œil (--muted-foreground) sur --muted", "--muted-foreground", "--muted"],
  ])("%s atteint 4,5:1", (_name, foreground, background) => {
    expect(contrastRatio(v(foreground), v(background))).toBeGreaterThanOrEqual(
      TEXT_CONTRAST_MINIMUM,
    );
  });

  it.each([
    ["bordure du champ (--input) sur --background", "--input", "--background"],
    ["bordure de focus (--primary) sur --background", "--primary", "--background"],
    ["anneau de focus (--ring) sur --background", "--ring", "--background"],
    ["contour de l'option active (--primary) sur --accent", "--primary", "--accent"],
    ["bordure d'erreur (--destructive) sur --background", "--destructive", "--background"],
  ])("%s atteint 3:1", (_name, foreground, background) => {
    expect(contrastRatio(v(foreground), v(background))).toBeGreaterThanOrEqual(
      UI_CONTRAST_MINIMUM,
    );
  });

  it("n'utilise pas la bordure décorative de la charte pour délimiter un champ", () => {
    expect(contrastRatio(charter.border, charter.surface)).toBeLessThan(
      UI_CONTRAST_MINIMUM,
    );
    expect(v("--input")).not.toBe(charter.border);
  });
});
