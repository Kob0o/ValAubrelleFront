import { MUNICIPALITY_CODE_PATTERN } from "@/components/explorer/map-view/map-model";
import type { ApiUser, ExplorerQuery } from "./types";

export function initialMunicipalityCode(user: Pick<ApiUser, "municipalityCodes">) {
  const code = user.municipalityCodes[0];
  if (!code || !MUNICIPALITY_CODE_PATTERN.test(code)) throw new Error("Aucune commune de focus autorisée.");
  return code;
}

export function explorerSearchParams(query: ExplorerQuery) {
  if (!MUNICIPALITY_CODE_PATTERN.test(query.municipalityCode)) throw new Error("Code INSEE invalide.");
  if (!query.referenceVersion.trim() || !query.indicatorId.trim()) throw new Error("Référence et indicateur obligatoires.");
  if (!["price", "dpe", "risk"].includes(query.layer)) throw new Error("Famille d’indicateur invalide.");
  if (![query.year, query.startYear, query.endYear].every(Number.isInteger) || query.startYear > query.year || query.year > query.endYear) throw new Error("Période invalide.");
  if (!Number.isFinite(query.zoom) || query.zoom < 0 || !Number.isFinite(query.lat) || Math.abs(query.lat) > 90 || !Number.isFinite(query.lng) || Math.abs(query.lng) > 180) throw new Error("Vue cartographique invalide.");
  const selection = [...new Set(query.selection ?? [])];
  if (selection.length > 32 || selection.some((code) => !MUNICIPALITY_CODE_PATTERN.test(code))) throw new Error("Sélection invalide.");
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(query)) {
    if (key !== "selection" && value !== undefined) params.set(key, String(value));
  }
  selection.forEach((code) => params.append("selection", code));
  return params;
}
