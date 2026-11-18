/** Double de l’API du moteur pour jsdom ; le rendu WebGL est vérifié en navigateur. */
import { vi } from "vitest";
import type { FeatureCollection } from "geojson";

type Listener = (event: Record<string, unknown>) => void;
export class MockMap {
  static instances: MockMap[] = [];
  static unavailable = false;
  sources = new Map<string, { data?: FeatureCollection; setData: (data: FeatureCollection) => Promise<void> }>();
  layers = new Map<string, Record<string, unknown>>();
  states = new Map<string, Record<string, boolean>>();
  images = new Map();
  listeners = new Map<string, Listener[]>();
  keyboard = { disableRotation: vi.fn() };
  touchZoomRotate = { disableRotation: vi.fn() };
  canvas = document.createElement("canvas");
  center: [number, number];
  zoom: number;
  removed = false;
  constructor(public options: { container: HTMLElement; center: [number, number]; zoom: number }) {
    if (MockMap.unavailable) throw new Error("WebGL unavailable");
    this.layers.set("background", {});
    this.center = options.center;
    this.zoom = options.zoom;
    this.canvas.tabIndex = 0;
    options.container.append(this.canvas);
    MockMap.instances.push(this);
    queueMicrotask(() => {
      if (this.removed) return;
      // Un premier ResizeObserver peut provoquer moveend avant load.
      this.fire("moveend");
      this.fire("load");
    });
  }
  on(type: string, layerOrListener: string | Listener, listener?: Listener) {
    const key = typeof layerOrListener === "string" ? `${type}:${layerOrListener}` : type;
    this.listeners.set(key, [...(this.listeners.get(key) ?? []), listener ?? layerOrListener as Listener]);
    return this;
  }
  fire(type: string, event = {}) { this.listeners.get(type)?.forEach((callback) => callback(event)); }
  getCanvas() { return this.canvas; }
  addControl() { return this; }
  addImage(name: string, image: unknown) { this.images.set(name, image); }
  updateImage(name: string, image: unknown) { this.images.set(name, image); }
  addSource(name: string, options: { data?: FeatureCollection }) {
    const source = { ...options, setData: async (data: FeatureCollection) => { source.data = data; } };
    this.sources.set(name, source);
  }
  getSource(name: string) { return this.sources.get(name); }
  removeSource(name: string) { this.sources.delete(name); }
  addLayer(layer: { id: string }) { this.layers.set(layer.id, { ...layer }); }
  getLayer(name: string) { return this.layers.get(name); }
  removeLayer(name: string) { this.layers.delete(name); }
  setPaintProperty(id: string, key: string, value: unknown) { this.layers.get(id)![key] = value; }
  setFeatureState(feature: { id: string }, state: Record<string, boolean>) { this.states.set(feature.id, { ...this.states.get(feature.id), ...state }); }
  removeFeatureState(feature: { id: string }) { this.states.delete(feature.id); }
  getCenter() { return { lng: this.center[0], lat: this.center[1] }; }
  getZoom() { return this.zoom; }
  getMinZoom() { return 8; }
  getMaxZoom() { return 16; }
  resize() { return this; }
  project() { return { x: 200, y: 200 }; }
  cameraForBounds(bounds: [[number, number], [number, number]]) { return { center: [(bounds[0][0] + bounds[1][0]) / 2, (bounds[0][1] + bounds[1][1]) / 2], zoom: 10.8 }; }
  jumpTo(view: { center?: [number, number]; zoom?: number }) {
    if (view.center) this.center = view.center;
    if (view.zoom !== undefined) this.zoom = view.zoom;
    this.fire("moveend");
    return this;
  }
  remove() { this.removed = true; this.options.container.replaceChildren(); }
}
class MockMarker {
  constructor(private options: { element: HTMLElement }) {}
  setLngLat() { return this; }
  addTo(map: MockMap) { map.options.container.append(this.options.element); return this; }
  getElement() { return this.options.element; }
  remove() { this.options.element.remove(); return this; }
}
class MockPopup {
  element = document.createElement("div");
  setLngLat() { return this; }
  setDOMContent(content: Node) { this.element.replaceChildren(content); return this; }
  addTo(map: MockMap) { map.options.container.append(this.element); return this; }
  remove() { this.element.remove(); return this; }
}
export const mapLibreMock = { setWorkerUrl: vi.fn(), Map: MockMap, Marker: MockMarker, Popup: MockPopup, AttributionControl: class {} };
