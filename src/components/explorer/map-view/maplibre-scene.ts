import { AttributionControl, Map as GLMap, Marker, Popup, setWorkerUrl } from "maplibre-gl";
import type { GeoJSONSource, MapLayerMouseEvent } from "maplibre-gl";
import { drawableMunicipalities, formatValue, municipalityValue } from "./map-model";
import { hatchImage, mapFeatures, municipalityAnchor, municipalityLabel, readMapColors, territoryBounds } from "./map-data";
import type { MapColors } from "./map-data";
import type { MapViewProps, Municipality } from "./types";
import styles from "./map-view.module.css";

export const COMMUNES_SOURCE = "communes";
export const FILLS_LAYER = "communes-fill";
export const TILES_SOURCE = "basemap";
const PATTERN = "no-data-hatch";

type Region = {
  button: HTMLButtonElement;
  marker: Marker;
  selectedMarker?: Marker;
  dispose: () => void;
};

/** Le moteur possède ses couches ; les mêmes boutons HTML restent focalisables. */
export class MapLibreScene {
  readonly map: GLMap;
  private props: MapViewProps;
  private colors: MapColors;
  private regions = new globalThis.Map<string, Region>();
  private popup: Popup;
  private ready = false;
  private layoutReady = false;
  private disposed = false;
  private announcedReady = false;
  private initialViewFitted = false;
  private readonly fitOnMount: boolean;
  private focused: string | null = null;
  private hovered: string | null = null;
  private dataSignature = "";
  private tilesSignature = "";
  private dataRevision = 0;
  private observer: ResizeObserver;
  private themeObserver: MutationObserver;
  private controlledView: { zoom: number; lat: number; lng: number };

  constructor(private host: HTMLElement, props: MapViewProps, private onReady: () => void, private onFailure: () => void) {
    this.props = props;
    this.fitOnMount = props.fitToTerritoryOnMount ?? false;
    this.colors = readMapColors(host);
    this.controlledView = { zoom: props.zoom, lat: props.center.lat, lng: props.center.lng };
    // Next émet le worker du paquet comme ressource versionnée du build.
    setWorkerUrl(new URL("maplibre-gl/dist/maplibre-gl-worker.mjs", import.meta.url).toString());
    this.map = new GLMap({
      container: host,
      center: [props.center.lng, props.center.lat], zoom: props.zoom, minZoom: 8, maxZoom: 16,
      bearing: 0, pitch: 0, maxPitch: 0, dragRotate: false, pitchWithRotate: false, touchPitch: false,
      scrollZoom: false, renderWorldCopies: false, attributionControl: false, trackResize: false,
      canvasContextAttributes: { antialias: true },
      style: { version: 8, projection: { type: "mercator" }, sources: {}, layers: [{ id: "background", type: "background", paint: { "background-color": this.colors.background } }] },
    });
    this.map.keyboard.disableRotation();
    this.map.touchZoomRotate.disableRotation();
    this.map.getCanvas().setAttribute("aria-label", "Déplacer la carte avec les flèches. Tab pour parcourir les communes.");
    this.map.addControl(new AttributionControl({ compact: false, customAttribution: "Val d’Aubrelle" }), "bottom-right");
    this.popup = new Popup({ closeButton: false, closeOnClick: false, focusAfterOpen: false, offset: 12, className: styles.tooltip });
    this.map.on("load", () => {
      try { this.load(); } catch { if (!this.disposed) this.onFailure(); }
    });
    this.map.on("moveend", () => {
      // Le redimensionnement avant le chargement ne doit pas annuler le cadrage initial.
      if (this.disposed || !this.ready || !this.layoutReady) return;
      const center = this.map.getCenter();
      this.props.onViewChange?.({ zoom: this.map.getZoom(), center: { lat: center.lat, lng: center.lng } });
    });
    this.map.on("error", () => { if (!this.disposed) this.onFailure(); });
    this.map.on("webglcontextlost", () => { if (!this.disposed) this.onFailure(); });
    this.observer = new ResizeObserver(() => {
      if (this.disposed) return;
      this.map.resize();
      this.fitInitialView();
    });
    this.observer.observe(host);
    this.themeObserver = new MutationObserver(() => {
      if (this.ready && !this.disposed) this.update(this.props);
    });
    this.themeObserver.observe(document.documentElement, { attributes: true, attributeFilter: ["class", "style"] });
  }

  private load() {
    if (this.disposed) return;
    this.map.addImage(PATTERN, hatchImage(this.colors));
    this.map.addSource(COMMUNES_SOURCE, { type: "geojson", data: { type: "FeatureCollection", features: [] }, promoteId: "code" });
    this.map.addLayer({ id: FILLS_LAYER, type: "fill", source: COMMUNES_SOURCE, paint: { "fill-color": ["get", "color"], "fill-opacity": 1 } });
    this.map.addLayer({ id: "communes-no-data", type: "fill", source: COMMUNES_SOURCE, filter: ["==", ["get", "noData"], true], paint: { "fill-pattern": PATTERN } });
    this.map.addLayer({
      id: "communes-border", type: "line", source: COMMUNES_SOURCE,
      layout: { "line-join": "miter", "line-cap": "butt", "line-miter-limit": 3 },
      paint: { "line-color": this.colors.border, "line-width": ["case", ["boolean", ["feature-state", "selected"], false], 4, ["boolean", ["feature-state", "hover"], false], 3, 1.2] },
    });
    this.map.addLayer({
      id: "communes-focus", type: "line", source: COMMUNES_SOURCE,
      layout: { "line-join": "miter" },
      paint: { "line-color": this.colors.selection, "line-width": 5, "line-dasharray": [2, 1], "line-opacity": ["case", ["boolean", ["feature-state", "focused"], false], 1, 0] },
    });
    this.map.on("click", FILLS_LAYER, (event: MapLayerMouseEvent) => {
      const code = event.features?.[0]?.properties.code;
      if (typeof code === "string" && this.regions.has(code)) this.props.onSelect(code);
    });
    this.map.on("mousemove", FILLS_LAYER, (event: MapLayerMouseEvent) => {
      const code = event.features?.[0]?.properties.code;
      if (typeof code !== "string" || !this.regions.has(code)) return;
      if (this.hovered !== code) {
        this.featureState(this.hovered, { hover: false });
        this.hovered = code;
        this.featureState(code, { hover: true });
      }
      this.map.getCanvas().style.cursor = "pointer";
      if (!this.focused) this.showPopup(code, [event.lngLat.lng, event.lngLat.lat]);
    });
    this.map.on("mouseleave", FILLS_LAYER, () => {
      this.featureState(this.hovered, { hover: false });
      this.hovered = null;
      this.map.getCanvas().style.cursor = "";
      if (!this.focused) this.popup.remove();
    });
    this.ready = true;
    this.update(this.props);
    this.fitInitialView();
  }

  update(props: MapViewProps) {
    this.props = props;
    if (!this.ready || this.disposed) return;
    const colors = readMapColors(this.host);
    if (JSON.stringify(colors) !== JSON.stringify(this.colors)) {
      this.colors = colors;
      this.map.updateImage(PATTERN, hatchImage(colors));
    }
    this.map.setPaintProperty("background", "background-color", colors.background);
    this.map.setPaintProperty("communes-border", "line-color", ["case", ["boolean", ["feature-state", "selected"], false], colors.selection, ["boolean", ["feature-state", "hover"], false], colors.hover, colors.border]);
    this.map.setPaintProperty("communes-focus", "line-color", colors.selection);
    const features = mapFeatures(props, colors);
    const signature = JSON.stringify(features);
    if (signature !== this.dataSignature) {
      this.dataSignature = signature;
      const revision = ++this.dataRevision;
      void this.map.getSource<GeoJSONSource>(COMMUNES_SOURCE)!.setData(features).then(() => {
        if (this.disposed || revision !== this.dataRevision) return;
        this.updateFeatureStates();
        if (!this.announcedReady) { this.announcedReady = true; this.onReady(); }
      }).catch(() => { if (!this.disposed) this.onFailure(); });
    }
    this.updateRegions();
    this.updateFeatureStates();
    this.updateTiles();
    const view = { zoom: props.zoom, lat: props.center.lat, lng: props.center.lng };
    if (Object.keys(view).some((key) => Math.abs(view[key as keyof typeof view] - this.controlledView[key as keyof typeof view]) > 1e-8)) {
      this.controlledView = view;
      const current = this.map.getCenter();
      if (Math.abs(current.lat - view.lat) > 1e-8 || Math.abs(current.lng - view.lng) > 1e-8 || Math.abs(this.map.getZoom() - view.zoom) > 1e-8) {
        this.map.jumpTo({ center: [view.lng, view.lat], zoom: view.zoom });
      }
    }
    const tooltipCode = this.focused ?? this.hovered;
    if (tooltipCode) this.showPopup(tooltipCode);
  }

  private updateRegions() {
    const municipalities = drawableMunicipalities(this.props.municipalities);
    const codes = new Set(municipalities.map((item) => item.code));
    for (const [code, region] of this.regions) {
      if (codes.has(code)) continue;
      region.dispose(); region.marker.remove(); region.selectedMarker?.remove(); this.regions.delete(code);
      this.map.removeFeatureState({ source: COMMUNES_SOURCE, id: code });
      if (this.focused === code) { this.focused = null; this.popup.remove(); }
      if (this.hovered === code) { this.hovered = null; this.popup.remove(); }
    }
    for (const municipality of municipalities) {
      const code = municipality.code;
      let region = this.regions.get(code);
      if (!region) {
        const button = document.createElement("button");
        button.type = "button";
        // Safari saute les boutons natifs sans tabindex explicite selon ses réglages clavier.
        button.tabIndex = 0;
        button.className = styles.keyboardButton;
        button.dataset.code = code;
        const click = (event: MouseEvent) => { event.stopPropagation(); this.props.onSelect(code); };
        const keydown = (event: KeyboardEvent) => { if (event.key === "Enter" || event.key === " ") event.stopPropagation(); };
        const focus = () => {
          this.focused = code;
          this.featureState(code, { focused: true });
          const current = this.props.municipalities.find((item) => item.code === code);
          if (!current?.geometry) return;
          const position = municipalityAnchor(current);
          const point = this.map.project(position);
          if (point.x < 32 || point.y < 32 || point.x > this.host.clientWidth - 32 || point.y > this.host.clientHeight - 32) this.map.jumpTo({ center: position });
          this.showPopup(code, position);
        };
        const blur = () => { this.featureState(code, { focused: false }); if (this.focused === code) this.focused = null; this.popup.remove(); };
        button.addEventListener("click", click);
        button.addEventListener("keydown", keydown);
        button.addEventListener("focus", focus);
        button.addEventListener("blur", blur);
        region = {
          button, marker: new Marker({ element: button, anchor: "center", subpixelPositioning: true }).setLngLat(municipalityAnchor(municipality)).addTo(this.map),
          dispose: () => { button.removeEventListener("click", click); button.removeEventListener("keydown", keydown); button.removeEventListener("focus", focus); button.removeEventListener("blur", blur); },
        };
        this.regions.set(code, region);
      }
      region.button.setAttribute("aria-label", municipalityLabel(municipality, this.props));
      region.button.setAttribute("aria-pressed", String(this.props.selection.includes(code)));
      region.marker.setLngLat(municipalityAnchor(municipality));
      if (this.props.selection.includes(code)) {
        if (!region.selectedMarker) {
          const label = document.createElement("div");
          label.className = styles.selectionLabel;
          label.setAttribute("aria-hidden", "true");
          region.selectedMarker = new Marker({ element: label, anchor: "bottom", offset: [0, -20], subpixelPositioning: true }).setLngLat(municipalityAnchor(municipality)).addTo(this.map);
        }
        const card = this.card(municipality, styles.selectedCard);
        region.selectedMarker.getElement().replaceChildren(card);
        region.selectedMarker.setLngLat(municipalityAnchor(municipality));
      } else if (region.selectedMarker) { region.selectedMarker.remove(); region.selectedMarker = undefined; }
    }
  }

  private card(municipality: Municipality, className?: string) {
    const card = document.createElement("div");
    if (className) card.className = className;
    const name = document.createElement("span"); name.textContent = municipality.name;
    const value = document.createElement("strong"); value.textContent = formatValue(municipalityValue(municipality.code, this.props.values, this.props.layer), this.props.classes);
    card.append(name, value);
    return card;
  }

  private showPopup(code: string, position?: [number, number]) {
    const municipality = this.props.municipalities.find((item) => item.code === code);
    if (!municipality?.geometry) return;
    // La carte de sélection contient déjà ces informations : éviter deux bulles superposées.
    if (this.props.selection.includes(code)) { this.popup.remove(); return; }
    const content = document.createElement("div");
    const name = document.createElement("strong"); name.textContent = municipality.name;
    const detail = document.createElement("span");
    detail.textContent = `${municipality.code} · ${formatValue(municipalityValue(code, this.props.values, this.props.layer), this.props.classes)}`;
    content.append(name, detail);
    content.setAttribute("role", "tooltip");
    this.popup.setLngLat(position ?? municipalityAnchor(municipality)).setDOMContent(content).addTo(this.map);
  }

  private featureState(code: string | null, state: Record<string, boolean>) {
    if (code && this.ready && !this.disposed) this.map.setFeatureState({ source: COMMUNES_SOURCE, id: code }, state);
  }

  private updateFeatureStates() {
    for (const code of this.regions.keys()) this.featureState(code, { selected: this.props.selection.includes(code), focused: this.focused === code, hover: this.hovered === code });
  }

  private updateTiles() {
    const signature = JSON.stringify([this.props.tileUrl, this.props.tileAttribution]);
    if (signature === this.tilesSignature) return;
    this.tilesSignature = signature;
    if (this.map.getLayer("basemap-raster")) this.map.removeLayer("basemap-raster");
    if (this.map.getSource(TILES_SOURCE)) this.map.removeSource(TILES_SOURCE);
    if (this.props.tileUrl) {
      this.map.addSource(TILES_SOURCE, { type: "raster", tiles: [this.props.tileUrl], tileSize: 256, attribution: this.props.tileAttribution ?? "" });
      this.map.addLayer({ id: "basemap-raster", type: "raster", source: TILES_SOURCE }, FILLS_LAYER);
    }
  }

  private fitInitialView() {
    if (!this.ready || !this.layoutReady || this.initialViewFitted || !this.fitOnMount) return;
    this.initialViewFitted = this.resetView();
  }

  /** La légende est maintenant rendue : cadrer avec les dimensions finales du canvas. */
  activate() {
    this.map.resize();
    this.layoutReady = true;
    this.fitInitialView();
  }

  resetView() {
    const bounds = territoryBounds(this.props.municipalities);
    if (!bounds || !this.host.clientWidth || !this.host.clientHeight) return false;
    const camera = this.map.cameraForBounds(bounds, { padding: 24 });
    if (!camera || camera.zoom === undefined) return false;
    this.map.jumpTo({ ...camera, zoom: Math.floor(camera.zoom * 2) / 2, bearing: 0, pitch: 0 });
    return true;
  }

  zoomBy(delta: number) { this.map.jumpTo({ zoom: Math.max(this.map.getMinZoom(), Math.min(this.map.getMaxZoom(), this.map.getZoom() + delta)) }); }

  destroy() {
    this.disposed = true;
    this.observer.disconnect(); this.themeObserver.disconnect(); this.popup.remove();
    this.regions.forEach((region) => { region.dispose(); region.marker.remove(); region.selectedMarker?.remove(); });
    this.regions.clear();
    this.map.remove();
  }
}
