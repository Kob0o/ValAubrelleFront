import type { FeatureCollection, MultiPolygon, Polygon } from "geojson";
import geography from "./municipalities.geo.json";
import type { ExplorerDataSource, ExplorerQuery, ExplorerResponse, ApiUser } from "@/api-mock/explorer/types";
import { ExplorerRequestError } from "@/api-mock/explorer/data-source";
import { explorerSearchParams, initialMunicipalityCode } from "@/api-mock/explorer/query";
import { toExplorerMapData } from "@/api-mock/explorer/adapter";

// Fixtures uniquement : aucune route API ni serveur de mocks n’est créé.
const collection = geography as FeatureCollection<Polygon | MultiPolygon, { code: string; name: string }>;
export const defaultCenter = { lat: 50.69, lng: 3.13 };
export const defaultZoom = 11;
export const mockIndicatorIds = { price: "average-sale-price", dpe: "dpe-fg-rate" } as const;
export const mockUser: ApiUser = {
  id: "00000000-0000-4000-8000-000000000001", name: "Agent Habitat · démonstration",
  email: "demo@example.test", role: "housing_officer",
  municipalityCodes: collection.features.map((feature) => feature.properties.code),
};
export const defaultExplorerQuery: ExplorerQuery = {
  municipalityCode: initialMunicipalityCode(mockUser), referenceVersion: "mock-2026-v1",
  indicatorId: mockIndicatorIds.price, layer: "price", year: 2026, startYear: 2026, endYear: 2026,
  selection: [initialMunicipalityCode(mockUser)], zoom: defaultZoom, ...defaultCenter,
};

const indicators: ExplorerResponse["indicators"] = [
  { id: mockIndicatorIds.price, label: "Prix moyen", family: "price", unit: "€/m²", shortDefinition: "Prix de vente moyen par mètre carré.", method: "Simulation locale.", limitations: ["Données fictives, sans valeur statistique."], isPublic: true },
  { id: mockIndicatorIds.dpe, label: "DPE F + G", family: "dpe", unit: "%", shortDefinition: "Part des DPE F et G parmi les diagnostics disponibles.", method: "Simulation locale.", limitations: ["Données fictives, sans valeur statistique."], isPublic: true },
];
const classes: ExplorerResponse["classes"] = [
  ...["Moins de 1 500", "1 500 à 1 999", "2 000 à 2 499", "2 500 à 2 999", "3 000 et plus"].map((label, index) => ({ id: `price-${index + 1}`, indicatorId: mockIndicatorIds.price, label, min: index ? 1000 + index * 500 : null, max: index < 4 ? 1500 + index * 500 : null, isNoData: false })),
  ...["Moins de 10 %", "10 à moins de 20 %", "20 à moins de 30 %", "30 à moins de 40 %", "40 % et plus"].map((label, index) => ({ id: `dpe-${index + 1}`, indicatorId: mockIndicatorIds.dpe, label, min: index ? index * 10 : null, max: index < 4 ? (index + 1) * 10 : null, isNoData: false })),
  ...Object.values(mockIndicatorIds).map((indicatorId) => ({ id: `${indicatorId}-no-data`, indicatorId, label: "Pas de donnée", isNoData: true })),
];
const years: ExplorerResponse["years"] = [2022, 2023, 2024, 2025, 2026].map((year) => ({ year, hasData: true }));

function valueClassId(indicatorId: string, value: number | null) {
  if (value === null) return `${indicatorId}-no-data`;
  return classes.find((item) => item.indicatorId === indicatorId && !item.isNoData && (item.min == null || value >= item.min) && (item.max == null || value < item.max))?.id ?? null;
}

function valuesForYear(year: number): ExplorerResponse["values"] {
  return collection.features.flatMap((feature, index) => {
    const missing = index === 4 || index === 24;
    const priceClass = (index * 3 + 1) % 5 + 1;
    const dpeClass = (index * 2 + 3) % 5 + 1;
    const elapsed = 2026 - year;
    const price = missing ? null : Math.round((1100 + (priceClass - 1) * 500 + (index * 37) % 350) * (1 - elapsed * 0.065));
    const dpe = missing ? null : Math.round(((dpeClass - 1) * 10 + 4 + (index % 5) * 0.8 + elapsed * 1.75) * 10) / 10;
    const base = { placeId: feature.properties.code, level: "municipality" as const, year, status: missing ? "missing" as const : "available" as const, sourceId: "mock-source", sampleSize: missing ? null : 50 + index };
    return [
      { ...base, indicatorId: mockIndicatorIds.price, value: price, classId: valueClassId(mockIndicatorIds.price, price) },
      { ...base, indicatorId: mockIndicatorIds.dpe, value: dpe, classId: valueClassId(mockIndicatorIds.dpe, dpe) },
    ];
  });
}

const valuesByYear = new Map(years.map(({ year }) => [year, valuesForYear(year)]));

export const mockExplorerResponse: ExplorerResponse = {
  municipalities: collection.features.map((feature) => ({ code: feature.properties.code, name: feature.properties.name, isPublic: true, geometry: feature.geometry })),
  districts: [], streets: [], values: valuesByYear.get(defaultExplorerQuery.year)!, classes, indicators,
  sources: [{ id: "mock-source", producer: "Démonstration locale", dataset: "Fixtures US-G0H", startYear: 2022, endYear: 2026, importDate: "2026-01-01", transformation: "Simulation ; aucune donnée réelle." }],
  years,
};

export function createMockExplorerDataSource(error?: ExplorerRequestError): ExplorerDataSource {
  return async (query, { signal }) => {
    signal.throwIfAborted();
    explorerSearchParams(query);
    if (error) throw error;
    if (!indicators.some((item) => item.id === query.indicatorId && item.family === query.layer) || !valuesByYear.has(query.year) || query.referenceVersion !== defaultExplorerQuery.referenceVersion || !mockUser.municipalityCodes.includes(query.municipalityCode)) {
      throw new ExplorerRequestError(422, { code: "MOCK_QUERY_UNAVAILABLE", message: "Cette consultation n’est pas disponible dans les fixtures de démonstration." });
    }
    return query.year === defaultExplorerQuery.year ? mockExplorerResponse : { ...mockExplorerResponse, values: valuesByYear.get(query.year)! };
  };
}
export const mockExplorerDataSource = createMockExplorerDataSource();

// Modèles de présentation des fixtures, pour les tests des composants isolés.
const mapData = toExplorerMapData(mockExplorerResponse, mockUser.municipalityCodes, 2026);
export const municipalities = mapData.municipalities;
export const indicatorClasses = mapData.classes;
export const indicatorValues = mapData.values;
