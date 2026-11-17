import { describe, expect, it } from "vitest";

import { contrastRatio, TEXT_CONTRAST_MINIMUM } from "@/theme/contrast";
import { charter } from "@/theme/tokens";
import { textContrastPairs } from "@/theme/themes";
import { getActiveTheme } from "@/theme/themes";

describe("contraste de la charte", () => {
  it.each(textContrastPairs)(
    "%s atteint 4,5:1",
    (_name, foreground, background) => {
      expect(contrastRatio(foreground, background)).toBeGreaterThanOrEqual(
        TEXT_CONTRAST_MINIMUM,
      );
    },
  );

  it("refuse le vert prairie comme couleur de texte sur blanc", () => {
    expect(contrastRatio(charter.accent, charter.surface)).toBeLessThan(
      TEXT_CONTRAST_MINIMUM,
    );
  });

  it("garde une palette de données séquentielle, sans rouge opposé au vert", () => {
    for (const color of charter.dataSeq) {
      const red = Number.parseInt(color.slice(1, 3), 16);
      const green = Number.parseInt(color.slice(3, 5), 16);
      expect(green).toBeGreaterThan(red);
    }
  });

  it("conserve une bordure de contrôle perceptible à au moins 3:1 sur les fonds de la charte", () => {
    const border = getActiveTheme().cssVariables["--input"];
    for (const surface of [charter.surface, charter.surfaceAlt]) {
      expect(contrastRatio(border, surface)).toBeGreaterThanOrEqual(3);
    }
  });
});
