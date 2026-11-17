import { describe, expect, it } from "vitest";

import { formatValue } from "@/lib/format";

describe("formatValue", () => {
  it("sépare les milliers par une espace insécable et utilise la virgule décimale", () => {
    const formatted = formatValue(3250.5, { precision: 1 });
    expect(formatted).toMatch(/^3[  ]250,5$/);
    expect(formatted).not.toContain(" ");
  });

  it("ajoute l'unité après une espace insécable", () => {
    expect(formatValue(3250, { unit: "€/m²" })).toMatch(/^3[  ]250 €\/m²$/);
  });

  it("formate un pourcentage exprimé en points", () => {
    expect(formatValue(12.5, { format: "percent" })).toBe("12,5 %");
    expect(formatValue(12, { format: "percent", precision: 0 })).toBe("12 %");
  });

  it("formate des euros", () => {
    expect(formatValue(1980, { format: "currency" })).toMatch(/^1[  ]980[  ]€$/);
  });

  it("affiche un vrai zéro tel quel", () => {
    expect(formatValue(0)).toBe("0");
  });
});
