import { act, fireEvent, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { indicatorClasses, indicatorValues, municipalities, defaultCenter } from "@/mocks/explorer";
import { MockMap } from "@/test/maplibre-mock";
import type { MapViewProps } from "./types";
import MapView from "./map-view";

vi.mock("maplibre-gl", async () => (await import("@/test/maplibre-mock")).mapLibreMock);
beforeEach(() => { MockMap.instances = []; MockMap.unavailable = false; });
afterEach(() => { vi.restoreAllMocks(); });

async function renderMap(overrides: Partial<MapViewProps> = {}) {
  const props: MapViewProps = { municipalities, values: indicatorValues, classes: indicatorClasses.price, layer: "price", selection: [], onSelect: vi.fn(), zoom: 11, center: defaultCenter, ...overrides };
  const result = render(<MapView {...props} />);
  if (!props.isLoading && !props.error && props.municipalities.some((m) => m.geometry && m.isInPerimeter)) {
    if (MockMap.unavailable) await screen.findByRole("alert");
    else await screen.findByRole("button", { name: "Zoom avant" });
  }
  return { ...result, props, map: MockMap.instances.at(-1)! };
}

describe("MapView — interactions MapLibre", () => {
  it("cadre le territoire au chargement comme au recentrage et conserve le zoom pendant un changement de couche", async () => {
    vi.spyOn(HTMLElement.prototype, "clientWidth", "get").mockReturnValue(800);
    vi.spyOn(HTMLElement.prototype, "clientHeight", "get").mockReturnValue(620);
    const onViewChange = vi.fn();
    const { props, rerender, map } = await renderMap({ fitToTerritoryOnMount: true, onViewChange });
    const initial = { zoom: map.getZoom(), center: map.getCenter() };
    expect(onViewChange).toHaveBeenCalledOnce();
    expect(onViewChange).toHaveBeenLastCalledWith(initial);
    fireEvent.click(screen.getByRole("button", { name: "Zoom avant" }));
    expect(map.getZoom()).toBeGreaterThan(initial.zoom);
    const chosen = map.getZoom();
    rerender(<MapView {...props} layer="dpe" classes={indicatorClasses.dpe} />);
    expect(map.getZoom()).toBe(chosen);
    fireEvent.click(screen.getByRole("button", { name: "Recentrer sur le territoire" }));
    expect({ zoom: map.getZoom(), center: map.getCenter() }).toEqual(initial);
  });

  it("respecte le centre et le zoom contrôlés sans cadrage automatique", async () => {
    const { props, rerender, map } = await renderMap({ zoom: 12, center: { lat: 50.7, lng: 3.15 } });
    expect(map.getZoom()).toBe(12);
    expect(map.getCenter()).toEqual({ lat: 50.7, lng: 3.15 });
    rerender(<MapView {...props} zoom={13} center={{ lat: 50.6, lng: 3.1 }} />);
    expect(map.getZoom()).toBe(13);
    expect(map.getCenter()).toEqual({ lat: 50.6, lng: 3.1 });
  });

  it("transmet 32 géométries WGS84 au moteur et conserve les boutons entre prix et DPE", async () => {
    const { container, rerender, props, map } = await renderMap();
    const buttons = container.querySelectorAll('button[data-code]');
    expect(buttons).toHaveLength(32);
    buttons.forEach((button) => expect(button).toHaveAttribute("tabindex", "0"));
    expect(map.getSource("communes")!.data!.features).toHaveLength(32);
    expect(map.getSource("communes")!.data!.features[0].geometry).toEqual(municipalities[0].geometry);
    expect(buttons[0]).toHaveAccessibleName(/€/);
    rerender(<MapView {...props} layer="dpe" classes={indicatorClasses.dpe} />);
    expect(container.querySelector('button[data-code]')).toBe(buttons[0]);
    expect(buttons[0]).toHaveAccessibleName(/%/);
  });

  it("entre depuis le canvas avec Tab, parcourt les 32 communes et ressort sans piéger le focus", async () => {
    const user = userEvent.setup();
    const { container } = await renderMap();
    const canvas = container.querySelector("canvas")!;
    act(() => canvas.focus());
    for (const municipality of municipalities.filter((item) => item.geometry && item.isInPerimeter)) {
      await user.tab();
      expect(container.querySelector(`[data-code="${municipality.code}"]`)).toHaveFocus();
    }
    await user.tab();
    expect(screen.getByRole("button", { name: "Zoom avant" })).toHaveFocus();
    await user.tab({ shift: true });
    expect(container.querySelector('[data-code="59032"]')).toHaveFocus();
  });

  it("conserve le focus après une réponse JSON complète et utilise le dernier callback de sélection", async () => {
    const user = userEvent.setup();
    const { container, rerender, props } = await renderMap();
    const button = container.querySelector<HTMLButtonElement>('[data-code="59001"]')!;
    act(() => button.focus());
    const next = structuredClone(municipalities);
    next[0].name = "Bois-des-Aulnes actualisé";
    const onSelect = vi.fn();
    rerender(<MapView {...props} municipalities={next} layer="dpe" classes={indicatorClasses.dpe} selection={["59001"]} onSelect={onSelect} />);
    expect(container.querySelector('[data-code="59001"]')).toBe(button);
    expect(button).toHaveFocus();
    expect(button).toHaveAccessibleName(/Bois-des-Aulnes actualisé.*%/);
    expect(button).toHaveAttribute("aria-pressed", "true");
    await user.keyboard(" ");
    expect(onSelect).toHaveBeenCalledWith("59001");
    expect(props.onSelect).not.toHaveBeenCalled();
  });

  it("actualise une géométrie sans perdre le focus et retire celles devenues absentes", async () => {
    const { container, rerender, props, map } = await renderMap();
    const button = container.querySelector<HTMLButtonElement>('[data-code="59001"]')!;
    act(() => button.focus());
    const next = structuredClone(municipalities);
    next[0].geometry = { type: "Polygon", coordinates: [[[3.1, 50.6], [3.2, 50.6], [3.2, 50.7], [3.1, 50.6]]] };
    next[1].geometry = null;
    rerender(<MapView {...props} municipalities={next} />);
    expect(container.querySelector('[data-code="59001"]')).toBe(button);
    expect(button).toHaveFocus();
    expect(container.querySelector('[data-code="59002"]')).not.toBeInTheDocument();
    expect(map.getSource("communes")!.data!.features).toHaveLength(31);
    expect(map.getSource("communes")!.data!.features[0].geometry).toEqual(next[0].geometry);
  });

  it("hachure les valeurs absentes et annonce leur absence", async () => {
    const { container, map } = await renderMap();
    expect(container.querySelector('[data-code="59005"]')).toHaveAccessibleName(/Pas de donnée/);
    expect(map.getSource("communes")!.data!.features.find((f) => f.id === "59005")!.properties).toMatchObject({ noData: true });
    expect(map.images.has("no-data-hatch")).toBe(true);
    expect(map.getLayer("communes-no-data")).toMatchObject({ paint: { "fill-pattern": "no-data-hatch" } });
    expect(screen.getByText("Pas de donnée")).toBeInTheDocument();
  });

  it("sélectionne par clic cartographique, Entrée et Espace puis annonce la sélection", async () => {
    const user = userEvent.setup();
    const onSelect = vi.fn();
    const { container, rerender, props, map } = await renderMap({ onSelect });
    const button = container.querySelector<HTMLButtonElement>('[data-code="59001"]')!;
    act(() => button.focus());
    act(() => map.fire("click:communes-fill", { features: [{ properties: { code: "59001" } }] }));
    await user.keyboard("{Enter}");
    await user.keyboard(" ");
    expect(onSelect.mock.calls).toEqual([["59001"], ["59001"], ["59001"]]);
    rerender(<MapView {...props} selection={["59001"]} />);
    expect(button).toHaveFocus();
    expect(map.states.get("59001")).toMatchObject({ selected: true, focused: true });
    expect(screen.getByRole("status")).toHaveTextContent("Commune sélectionnée : Bois-des-Aulnes");
  });

  it("écarte les communes hors périmètre ou sans géométrie", async () => {
    const { container } = await renderMap({ municipalities: [{ ...municipalities[0], geometry: null }, { ...municipalities[1], isInPerimeter: false }, municipalities[2]] });
    expect(container.querySelectorAll('button[data-code]')).toHaveLength(1);
    expect(container.querySelector('[data-code="59003"]')).toBeInTheDocument();
  });

  it("affiche le nom, le code INSEE et la valeur au survol sans doubler la carte de sélection", async () => {
    const { props, rerender, map } = await renderMap();
    const event = { features: [{ properties: { code: "59001" } }], lngLat: { lng: 3.1, lat: 50.7 } };
    act(() => map.fire("mousemove:communes-fill", event));
    expect(screen.getByRole("tooltip")).toHaveTextContent(/Bois-des-Aulnes.*59001.*€/);
    rerender(<MapView {...props} selection={["59001"]} />);
    expect(screen.queryByRole("tooltip")).not.toBeInTheDocument();
  });

  it("affiche les états chargement, vide et erreur sans construire de moteur", async () => {
    const { rerender, props } = await renderMap({ isLoading: true });
    expect(screen.getByRole("status")).toHaveTextContent("Chargement");
    rerender(<MapView {...props} isLoading={false} municipalities={[]} />);
    expect(screen.getByRole("status")).toHaveTextContent("Aucune commune à afficher");
    expect(screen.getByRole("status")).toHaveTextContent("consultables dans la liste");
    const onRetry = vi.fn();
    rerender(<MapView {...props} isLoading={false} error={{ status: 503, message: "Service indisponible" }} onRetry={onRetry} />);
    expect(screen.getByRole("alert")).toHaveTextContent("503");
    fireEvent.click(screen.getByRole("button", { name: "Réessayer" }));
    expect(onRetry).toHaveBeenCalledOnce();
    expect(MockMap.instances).toHaveLength(0);
  });

  it("normalise les erreurs et réserve la référence aux erreurs serveur", async () => {
    const error = { status: 503, message: "SQL password=secret", correlationId: "support-123" };
    const { rerender, props } = await renderMap({ error });
    expect(screen.getByRole("alert")).not.toHaveTextContent("SQL password=secret");
    expect(screen.getByRole("button", { name: "Copier la référence" })).toBeInTheDocument();
    rerender(<MapView {...props} error={{ ...error, status: 403 }} />);
    expect(screen.getByRole("alert")).toHaveTextContent("pas accès");
    expect(screen.queryByText("support-123")).not.toBeInTheDocument();
  });

  it("présente une panne de tuiles explicite et recrée le moteur au nouvel essai", async () => {
    const onRetry = vi.fn();
    const { map } = await renderMap({ tileUrl: "https://tiles.example.test/{z}/{x}/{y}.png", onRetry });
    expect(map.getSource("basemap")).toBeDefined();
    act(() => map.fire("error"));
    expect(screen.getByRole("alert")).toHaveTextContent("503");
    fireEvent.click(screen.getByRole("button", { name: "Réessayer" }));
    await screen.findByRole("button", { name: "Zoom avant" });
    expect(map.removed).toBe(true);
    expect(MockMap.instances).toHaveLength(2);
    expect(onRetry).toHaveBeenCalledOnce();
  });

  it("signale WebGL indisponible et permet de réessayer", async () => {
    MockMap.unavailable = true;
    await renderMap();
    expect(screen.getByRole("alert")).toHaveTextContent("503");
    MockMap.unavailable = false;
    fireEvent.click(screen.getByRole("button", { name: "Réessayer" }));
    await waitFor(() => expect(screen.getByRole("button", { name: "Zoom avant" })).toBeInTheDocument());
  });
});
