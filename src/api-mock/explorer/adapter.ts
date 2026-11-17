import type { IndicatorFamily, IndicatorValue, Municipality, ValueClass } from "@/components/explorer/map-view/types";
import type { ExplorerResponse } from "./types";

export type ExplorerMapData = {
  municipalities: Municipality[];
  values: IndicatorValue[];
  classes: Record<IndicatorFamily, ValueClass[]>;
};

/** isPublic est la visibilité publique ; le périmètre vient du contexte utilisateur. */
export function toExplorerMapData(response: ExplorerResponse, allowedCodes: string[], year: number, indicatorId?: string): ExplorerMapData {
  const allowed = new Set(allowedCodes);
  const indicators = response.indicators.filter((item) => item.family === "price" || item.family === "dpe");
  const classes: ExplorerMapData["classes"] = { price: [], dpe: [] };
  for (const layer of ["price", "dpe"] as const) {
    const indicator = indicators.find((item) => item.family === layer && item.id === indicatorId) ?? indicators.find((item) => item.family === layer);
    const familyClasses = response.classes.filter((item) => item.indicatorId === indicator?.id);
    const ranked = familyClasses.filter((item) => !item.isNoData).sort((a, b) => (a.min ?? -Infinity) - (b.min ?? -Infinity));
    classes[layer] = familyClasses.map((item) => ({
      id: item.id, label: item.label, isNoData: item.isNoData,
      paletteIndex: item.isNoData ? undefined : Math.min(5, ranked.indexOf(item) + 1) as ValueClass["paletteIndex"],
    }));
  }
  const values = response.values.flatMap((item): IndicatorValue[] => {
    if (item.status === "suppressed" || item.level !== "municipality" || item.year !== year || !allowed.has(item.placeId)) return [];
    const indicator = indicators.find((indicator) => indicator.id === item.indicatorId);
    if (!indicator || (indicator.family !== "price" && indicator.family !== "dpe")) return [];
    const chosen = indicators.find((entry) => entry.family === indicator.family && entry.id === indicatorId) ?? indicators.find((entry) => entry.family === indicator.family);
    if (chosen?.id !== item.indicatorId) return [];
    return [{ municipalityCode: item.placeId, layer: indicator.family, value: item.status === "available" ? item.value ?? null : null, classId: item.classId ?? null }];
  });
  return {
    municipalities: response.municipalities.map((item) => ({ code: item.code, name: item.name, geometry: item.geometry ?? null, isInPerimeter: allowed.has(item.code) })),
    values, classes,
  };
}
