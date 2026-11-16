import { describe, expect, it } from "vitest";

import { contrastRatio, TEXT_CONTRAST_MINIMUM } from "@/theme/contrast";
import { charter } from "@/theme/tokens";

/** WCAG 1.4.11 / RGAA 3.3 : composants d'interface et indicateurs de focus. */
const UI_CONTRAST_MINIMUM = 3;

describe("contraste des champs de formulaire", () => {
  it.each([
    ["libellé et saisie (Anthracite) sur blanc", charter.text, charter.surface],
    ["aide et placeholder (Gris ardoise) sur blanc", charter.textMuted, charter.surface],
    ["message d'erreur sur blanc", charter.danger, charter.surface],
    ["texte désactivé sur Brume", charter.textMuted, charter.surfaceAlt],
    ["texte lecture seule sur Brume", charter.text, charter.surfaceAlt],
  ])("%s atteint 4,5:1", (_name, foreground, background) => {
    expect(contrastRatio(foreground, background)).toBeGreaterThanOrEqual(
      TEXT_CONTRAST_MINIMUM,
    );
  });

  it.each([
    ["bordure du champ (Gris ardoise) sur blanc", charter.textMuted, charter.surface],
    ["focus (Vert Aubrelle) sur blanc", charter.primary, charter.surface],
    ["focus de l'option active sur Brume", charter.primary, charter.surfaceAlt],
    ["bordure d'erreur sur blanc", charter.danger, charter.surface],
  ])("%s atteint 3:1", (_name, foreground, background) => {
    expect(contrastRatio(foreground, background)).toBeGreaterThanOrEqual(
      UI_CONTRAST_MINIMUM,
    );
  });

  it("n'utilise pas la bordure de la charte pour délimiter un champ (trop claire)", () => {
    expect(contrastRatio(charter.border, charter.surface)).toBeLessThan(
      UI_CONTRAST_MINIMUM,
    );
  });
});
