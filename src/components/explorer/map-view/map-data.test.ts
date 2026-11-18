import { describe, expect, it } from "vitest";
import { indicatorClasses, indicatorValues, municipalities, defaultCenter } from "@/mocks/explorer";
import { charter } from "@/theme/tokens";
import { hatchImage, mapFeatures, municipalityAnchor, territoryBounds } from "./map-data";
import type { MapColors } from "./map-data";
import type { MapViewProps, Municipality } from "./types";

const colors: MapColors = { surface: charter.surface, background: charter.surfaceAlt, border: charter.textMuted, selection: charter.primaryStrong, hover: charter.text, palette: [...charter.dataSeq] };
const props: MapViewProps = { municipalities, values: indicatorValues, classes: indicatorClasses.price, layer: "price", selection: [], onSelect: () => {}, zoom: 11, center: defaultCenter };

describe("GeoJSON et style MapLibre", () => {
  it("associe les identifiants INSEE aux couleurs partagées et distingue les données absentes", () => {
    const features = mapFeatures(props, colors).features;
    expect(new Set(features.map((f) => f.id)).size).toBe(32);
    for (const feature of features) {
      expect(feature.id).toBe(feature.properties.code);
      expect(feature.geometry).toEqual(municipalities.find((m) => m.code === feature.id)!.geometry);
      expect(feature.properties.noData ? [colors.background] : colors.palette).toContain(feature.properties.color);
    }
    const next = mapFeatures({ ...props, values: props.values.map((v) => ({ ...v, value: null })) }, colors);
    expect(next.features.every((f) => f.properties.noData)).toBe(true);
  });

  it("cadre aussi les îlots des MultiPolygon en gardant l’ordre longitude/latitude", () => {
    const commune: Municipality = { code: "59001", name: "Îlots", isInPerimeter: true, geometry: { type: "MultiPolygon", coordinates: [
      [[[3, 50], [3.1, 50], [3, 50.1], [3, 50]]],
      [[[3.2, 50.2], [3.3, 50.2], [3.2, 50.3], [3.2, 50.2]]],
    ] } };
    expect(territoryBounds([commune])).toEqual([[3, 50], [3.3, 50.3]]);
    expect(municipalityAnchor(commune)).toEqual([3.15, 50.15]);
    expect(mapFeatures({ ...props, municipalities: [commune] }, colors).features[0].geometry).toBe(commune.geometry);
    expect(territoryBounds([{ ...commune, isInPerimeter: false }])).toBeNull();
  });

  it("génère des hachures opaques avec les couleurs du thème", () => {
    const image = hatchImage(colors);
    const pixels = new Set<string>();
    for (let i = 0; i < image.data.length; i += 4) pixels.add([...image.data.slice(i, i + 4)].join(","));
    expect(pixels).toEqual(new Set(["241,246,242,255", "93,107,100,255"]));
  });
});
