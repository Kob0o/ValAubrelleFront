import type { FeatureCollection, MultiPolygon, Polygon } from "geojson";
import { charter } from "@/theme/tokens";
import { drawableMunicipalities, formatValue, municipalityValue, valuePresentation } from "./map-model";
import type { MapViewProps, Municipality } from "./types";

export type MapColors = {
  surface: string;
  background: string;
  border: string;
  selection: string;
  hover: string;
  palette: string[];
};

export function readMapColors(host: HTMLElement): MapColors {
  const style = getComputedStyle(host);
  const color = (name: string, fallback: string) => style.getPropertyValue(name).trim() || fallback;
  return {
    surface: color("--color-surface", charter.surface),
    background: color("--color-surface-alt", charter.surfaceAlt),
    border: color("--color-text-muted", charter.textMuted),
    selection: color("--color-primary-strong", charter.primaryStrong),
    hover: color("--color-text", charter.text),
    palette: charter.dataSeq.map((fallback, index) => color(`--data-seq-${index + 1}`, fallback)),
  };
}

export type CommuneProperties = { code: string; color: string; noData: boolean };
export type CommuneCollection = FeatureCollection<Polygon | MultiPolygon, CommuneProperties>;

export function mapFeatures(props: MapViewProps, colors: MapColors): CommuneCollection {
  return {
    type: "FeatureCollection",
    features: drawableMunicipalities(props.municipalities).map((municipality) => {
      const value = municipalityValue(municipality.code, props.values, props.layer);
      const presentation = valuePresentation(value, props.classes);
      const valueClass = props.classes.find((entry) => entry.id === value?.classId);
      return {
        type: "Feature", id: municipality.code, geometry: municipality.geometry!,
        properties: { code: municipality.code, noData: presentation.isNoData, color: presentation.isNoData ? colors.background : colors.palette[(valueClass?.paletteIndex ?? 1) - 1] },
      };
    }),
  };
}

export type TerritoryBounds = [[number, number], [number, number]];

export function territoryBounds(municipalities: Municipality[]): TerritoryBounds | null {
  let west = Infinity, south = Infinity, east = -Infinity, north = -Infinity;
  for (const municipality of drawableMunicipalities(municipalities)) {
    const geometry = municipality.geometry!;
    const rings = geometry.type === "Polygon" ? geometry.coordinates : geometry.coordinates.flat();
    for (const ring of rings) for (const [lng, lat] of ring) {
      if (!Number.isFinite(lng) || !Number.isFinite(lat)) continue;
      west = Math.min(west, lng); east = Math.max(east, lng);
      south = Math.min(south, lat); north = Math.max(north, lat);
    }
  }
  return Number.isFinite(west) ? [[west, south], [east, north]] : null;
}

export function municipalityAnchor(municipality: Municipality): [number, number] {
  const bounds = territoryBounds([municipality]);
  if (!bounds) throw new Error("Géométrie communale indisponible.");
  return [(bounds[0][0] + bounds[1][0]) / 2, (bounds[0][1] + bounds[1][1]) / 2];
}

export function municipalityLabel(municipality: Municipality, props: MapViewProps) {
  const value = municipalityValue(municipality.code, props.values, props.layer);
  return `${municipality.name} (${municipality.code}) · ${formatValue(value, props.classes)} · ${valuePresentation(value, props.classes).label}`;
}

/** Motif RGBA local : aucune image distante ni couleur propre au moteur. */
export function hatchImage(colors: MapColors) {
  const rgb = (color: string) => {
    if (/^#[\da-f]{6}$/i.test(color)) return [1, 3, 5].map((index) => Number.parseInt(color.slice(index, index + 2), 16));
    const channels = color.match(/[\d.]+/g)?.slice(0, 3).map(Number);
    if (!channels || channels.length !== 3) throw new Error("Couleur du thème invalide.");
    return channels;
  };
  const background = rgb(colors.background), stroke = rgb(colors.border);
  const data = new Uint8Array(8 * 8 * 4);
  for (let y = 0; y < 8; y++) for (let x = 0; x < 8; x++) {
    data.set([...((x + y) % 8 < 2 ? stroke : background), 255], (y * 8 + x) * 4);
  }
  return { width: 8, height: 8, data };
}
