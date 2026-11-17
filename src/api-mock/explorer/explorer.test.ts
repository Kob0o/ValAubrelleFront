import { describe, expect, it } from "vitest";
import { createMockExplorerDataSource, defaultExplorerQuery, mockExplorerResponse, mockIndicatorIds, mockUser } from "@/mocks/explorer";
import { drawableMunicipalities, valuePresentation } from "@/components/explorer/map-view/map-model";
import { toExplorerMapData } from "./adapter";
import { ExplorerRequestError } from "./data-source";
import { explorerSearchParams, initialMunicipalityCode } from "./query";
import type { ApiIndicatorValue, ExplorerResponse } from "./types";

const response = (): ExplorerResponse => JSON.parse(JSON.stringify(mockExplorerResponse));

describe("branchement GET /explorer côté front", () => {
  it("sérialise tous les paramètres obligatoires et les sélections comme clés répétées", () => {
    const params = explorerSearchParams({ ...defaultExplorerQuery, selection: ["59001", "2A004", "59001"], districtId: "iris-1" });
    for (const field of ["municipalityCode", "referenceVersion", "indicatorId", "layer", "year", "startYear", "endYear", "zoom", "lat", "lng"]) expect(params.has(field)).toBe(true);
    expect(params.getAll("selection")).toEqual(["59001", "2A004"]);
    expect(params.has("selection[]")).toBe(false);
    expect(params.get("districtId")).toBe("iris-1");
  });

  it("prend le premier code du contexte utilisateur comme focus initial", () => {
    expect(initialMunicipalityCode({ municipalityCodes: ["2B123", "59001"] })).toBe("2B123");
    expect(() => initialMunicipalityCode({ municipalityCodes: [] })).toThrow();
  });

  it.each([
    { municipalityCode: "invalide" }, { referenceVersion: "" }, { indicatorId: "" },
    { startYear: 2027 }, { year: 2026.5 }, { lat: 91 }, { lng: -181 }, { zoom: NaN }, { selection: ["invalide"] },
  ])("refuse les paramètres incohérents (%j)", (overrides) => {
    expect(() => explorerSearchParams({ ...defaultExplorerQuery, ...overrides })).toThrow();
  });

  it("renvoie une réponse mock complète avec les 32 communes, même quand le focus change", async () => {
    const data = await createMockExplorerDataSource()({ ...defaultExplorerQuery, municipalityCode: "59002" }, { signal: new AbortController().signal });
    expect(data.municipalities).toHaveLength(32);
    for (const field of ["districts", "streets", "values", "classes", "indicators", "sources", "years"] as const) expect(Array.isArray(data[field])).toBe(true);
    expect(data.values).toHaveLength(64);
    expect(data.values.every((item) => item.status !== "suppressed")).toBe(true);
    expect(data.values.every((item) => data.sources.some((source) => source.id === item.sourceId))).toBe(true);
  });

  it("propage un échec 503 et une annulation sans les convertir en succès mocké", async () => {
    const failure = new ExplorerRequestError(503, { code: "SERVICE_UNAVAILABLE", message: "Service indisponible" });
    await expect(createMockExplorerDataSource(failure)(defaultExplorerQuery, { signal: new AbortController().signal })).rejects.toBe(failure);
    const controller = new AbortController(); controller.abort();
    await expect(createMockExplorerDataSource()(defaultExplorerQuery, { signal: controller.signal })).rejects.toHaveProperty("name", "AbortError");
  });

  it("filtre les valeurs et leurs classes sur l’année demandée", async () => {
    const data = await createMockExplorerDataSource()({ ...defaultExplorerQuery, year: 2022, startYear: 2022, endYear: 2022 }, { signal: new AbortController().signal });
    expect(data.values).toHaveLength(64);
    expect(data.values.every((item) => item.year === 2022)).toBe(true);
    const price = data.values.find((item) => item.placeId === "59001" && item.indicatorId === mockIndicatorIds.price);
    const dpe = data.values.find((item) => item.placeId === "59001" && item.indicatorId === mockIndicatorIds.dpe);
    expect(price).toMatchObject({ value: 1184, classId: "price-1" });
    expect(dpe).toMatchObject({ value: 41, classId: "dpe-5" });
    expect(toExplorerMapData(data, mockUser.municipalityCodes, 2022).values.find((item) => item.municipalityCode === "59001" && item.layer === "price")?.value).toBe(1184);
    expect(mockExplorerResponse.values[0]).toMatchObject({ year: 2026, value: 1600 });
  });

  it("annonce les années disponibles et refuse une année non couverte", async () => {
    expect(mockExplorerResponse.years).toEqual([2022, 2023, 2024, 2025, 2026].map((year) => ({ year, hasData: true })));
    await expect(createMockExplorerDataSource()({ ...defaultExplorerQuery, year: 2021, startYear: 2021, endYear: 2021 }, { signal: new AbortController().signal })).rejects.toHaveProperty("status", 422);
  });
});

describe("adaptateur API vers MapView", () => {
  it("conserve les communes non publiques autorisées et écarte le hors périmètre", () => {
    const data = response(); data.municipalities[0].isPublic = false;
    const model = toExplorerMapData(data, ["59001"], 2026);
    expect(drawableMunicipalities(model.municipalities).map((item) => item.code)).toEqual(["59001"]);
    expect(model.values.every((item) => item.municipalityCode === "59001")).toBe(true);
  });

  it("transforme les géométries absentes/nulles sans retirer les communes de la liste", () => {
    const data = response(); data.municipalities[0].geometry = null; delete data.municipalities[1].geometry;
    const model = toExplorerMapData(data, mockUser.municipalityCodes, 2026);
    expect(model.municipalities).toHaveLength(32);
    expect(drawableMunicipalities(model.municipalities)).toHaveLength(30);
  });

  it.each<ApiIndicatorValue["status"]>(["missing", "insufficient_sample", "source_error", "not_computable"])("hachure le statut %s même si une valeur numérique incohérente est fournie", (status) => {
    const data = response(); data.values[0] = { ...data.values[0], status, value: 1900 };
    const model = toExplorerMapData(data, mockUser.municipalityCodes, 2026);
    expect(valuePresentation(model.values[0], model.classes.price).isNoData).toBe(true);
  });

  it("exclut suppressed, les autres années et les autres mailles", () => {
    const data = response(); data.values = [{ ...data.values[0], status: "suppressed" }, { ...data.values[1], year: 2025 }, { ...data.values[2], level: "street" }];
    expect(toExplorerMapData(data, mockUser.municipalityCodes, 2026).values).toEqual([]);
  });

  it("résout les familles depuis indicatorId et calcule la palette depuis les bornes de classe", () => {
    const data = response(); data.classes.reverse();
    const model = toExplorerMapData(data, mockUser.municipalityCodes, 2026, mockIndicatorIds.dpe);
    expect(model.values[0]).toMatchObject({ municipalityCode: "59001", layer: "price", classId: "price-2" });
    expect(model.classes.price.find((item) => item.id === "price-2")?.paletteIndex).toBe(2);
    expect(model.classes.dpe.filter((item) => item.isNoData).every((item) => item.paletteIndex === undefined)).toBe(true);
    expect(valuePresentation(model.values[0], model.classes.price).color).toBe("var(--data-seq-2)");
  });
});
