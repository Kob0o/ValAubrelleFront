import type { MultiPolygon, Polygon } from "geojson";
import type { components } from "@/api-mock/generated/contract";

/** Modèles de présentation, construits depuis les DTO générés par l’adaptateur. */
export type IndicatorFamily = Extract<components["schemas"]["IndicatorFamily"], "price" | "dpe">;

export type Municipality = {
  code: string;
  name: string;
  geometry: Polygon | MultiPolygon | null;
  isInPerimeter: boolean;
};

export type IndicatorValue = {
  municipalityCode: string;
  layer: IndicatorFamily;
  value: number | null;
  classId: string | null;
};

export type ValueClass = {
  id: string;
  label: string;
  paletteIndex?: 1 | 2 | 3 | 4 | 5;
  isNoData: boolean;
};

/** Objet WGS84 explicite : GeoJSON utilise [lng, lat], Leaflet [lat, lng]. */
export type MapCenter = { lat: number; lng: number };

export type MapError = { status: number; message: string; code?: string; correlationId?: string };

export type MapViewProps = {
  municipalities: Municipality[];
  values: IndicatorValue[];
  classes: ValueClass[];
  layer: IndicatorFamily;
  selection: string[];
  onSelect: (code: string) => void;
  zoom: number;
  center: MapCenter;
  onViewChange?: (view: { zoom: number; center: MapCenter }) => void;
  /** Ajuste la première vue aux géométries, comme l’action de recentrage. */
  fitToTerritoryOnMount?: boolean;
  isLoading?: boolean;
  error?: MapError | null;
  onRetry?: () => void;
  /** Facultatif : le prototype fictif fonctionne sans fournisseur de tuiles. */
  tileUrl?: string;
  tileAttribution?: string;
};
