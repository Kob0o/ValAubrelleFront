import { describe, expect, it } from "vitest";
import { indicatorClasses, indicatorValues, municipalities } from "@/mocks/explorer";
import geography from "@/mocks/municipalities.geo.json";
import { classColor, DATA_PALETTE } from "./palette";
import { drawableMunicipalities, formatValue, inPerimeter, MUNICIPALITY_CODE_PATTERN, municipalityValue, valuePresentation } from "./map-model";
import type { IndicatorFamily, IndicatorValue } from "./types";

describe("contrat des fixtures cartographiques", () => {
  it("fournit 32 communes uniques et dessinables sans réintroduire Saint-Laurent", () => {
    expect(municipalities).toHaveLength(32);
    expect(drawableMunicipalities(municipalities)).toHaveLength(32);
    expect(new Set(municipalities.map((item) => item.code)).size).toBe(32);
    expect(municipalities.find((item) => item.code === "59032")?.name).toBe("Aubrelle-les-Prés");
    for (const item of municipalities) expect(item.code).toMatch(MUNICIPALITY_CODE_PATTERN);
    expect(MUNICIPALITY_CODE_PATTERN.test("2A004")).toBe(true);
    expect(MUNICIPALITY_CODE_PATTERN.test("2B123")).toBe(true);
    expect(MUNICIPALITY_CODE_PATTERN.test("wrong")).toBe(false);
  });

  it("contient des Polygon et MultiPolygon fermés en WGS84 [longitude, latitude]", () => {
    expect(geography.type).toBe("FeatureCollection");
    expect(new Set(municipalities.map((item) => item.geometry?.type))).toEqual(new Set(["Polygon", "MultiPolygon"]));
    for (const item of municipalities) {
      const geometry = item.geometry!;
      const polygons = geometry.type === "Polygon" ? [geometry.coordinates] : geometry.coordinates;
      for (const polygon of polygons) for (const ring of polygon) {
        expect(ring.length).toBeGreaterThanOrEqual(4);
        expect(ring[0]).toEqual(ring.at(-1));
        for (const [lng, lat] of ring) {
          expect(lng).toBeGreaterThan(2); expect(lng).toBeLessThan(4);
          expect(lat).toBeGreaterThan(50); expect(lat).toBeLessThan(51);
        }
      }
    }
  });

  it.each<IndicatorFamily>(["price", "dpe"])("fournit une valeur ou un null pour chaque commune en %s", (layer) => {
    for (const municipality of municipalities) {
      const value = municipalityValue(municipality.code, indicatorValues, layer);
      expect(value).toBeDefined();
      expect(indicatorClasses[layer].some((item) => item.id === value?.classId)).toBe(true);
    }
    expect(indicatorValues.filter((item) => item.layer === layer && item.value === null)).toHaveLength(2);
  });
});

describe("périmètre et valeurs", () => {
  it("exclut le hors périmètre et les identifiants invalides de la carte et de la liste", () => {
    const input = [municipalities[0], { ...municipalities[1], isInPerimeter: false }, { ...municipalities[2], code: "invalid" }];
    expect(drawableMunicipalities(input)).toEqual([municipalities[0]]);
    expect(inPerimeter(input)).toEqual([municipalities[0]]);
  });

  it("garde une géométrie null dans la liste mais ne la dessine pas", () => {
    const input = [{ ...municipalities[0], geometry: null }];
    expect(drawableMunicipalities(input)).toEqual([]);
    expect(inPerimeter(input)).toHaveLength(1);
  });

  const value: IndicatorValue = { municipalityCode: "59001", layer: "price", value: 1900, classId: "price-2" };
  it("résout classId vers la classe, indépendamment de l’ordre de la légende", () => {
    expect(valuePresentation(value, [...indicatorClasses.price].reverse())).toEqual({ color: "var(--data-seq-2)", label: "1 500 à 1 999", isNoData: false });
  });

  it.each([undefined, { ...value, value: null }, { ...value, value: NaN }, { ...value, classId: "no-data" }, { ...value, classId: "unknown" }])("ne colorie jamais une donnée manquante ou incohérente (%j)", (input) => {
    expect(valuePresentation(input, indicatorClasses.price)).toEqual({ color: null, label: "Pas de donnée", isNoData: true });
    expect(formatValue(input, indicatorClasses.price)).toBe("Pas de donnée");
  });

  it("considère zéro comme une valeur et respecte la famille d’indicateur", () => {
    expect(valuePresentation({ ...value, value: 0 }, indicatorClasses.price).isNoData).toBe(false);
    const dpe = municipalityValue("59001", indicatorValues, "dpe");
    expect(dpe?.layer).toBe("dpe");
    expect(formatValue(dpe, indicatorClasses.dpe)).toContain("%");
  });

  it("utilise seulement les tokens de la palette et ne donne aucune couleur à isNoData", () => {
    expect(DATA_PALETTE).toHaveLength(5);
    expect(classColor({ id: "none", label: "Pas de donnée", isNoData: true, paletteIndex: 5 })).toBeNull();
  });
});
