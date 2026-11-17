import { act, cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeAll, describe, expect, it, vi } from "vitest";
import type { TileLayer } from "leaflet";
import { indicatorClasses, indicatorValues, municipalities, defaultCenter } from "@/mocks/explorer";
import type { MapViewProps } from "./types";

// jsdom ne dessine pas de SVG et ne dispose pas de ResizeObserver.
beforeAll(() => {
  Object.defineProperty(SVGSVGElement.prototype, "createSVGRect", { configurable: true, value: () => ({}) });
  vi.stubGlobal("ResizeObserver", class { observe() {} disconnect() {} });
});
afterEach(cleanup);

async function renderMap(overrides: Partial<MapViewProps> = {}) {
  // Import après le polyfill : Leaflet détecte SVG à l’import.
  const { default: MapView } = await import("./map-view");
  const props: MapViewProps = { municipalities, values: indicatorValues, classes: indicatorClasses.price, layer: "price", selection: [], onSelect: vi.fn(), zoom: 11, center: defaultCenter, ...overrides };
  return { ...render(<MapView {...props} />), props, MapView };
}

describe("MapView avec le vrai moteur Leaflet SVG", () => {
  it("dessine les 32 communes en prix puis DPE sans perdre les éléments focalisables", async () => {
    const { container, rerender, props, MapView } = await renderMap();
    const paths = container.querySelectorAll('path[role="button"]');
    expect(paths).toHaveLength(32);
    expect(container.querySelector(".leaflet-marker-icon")).not.toBeInTheDocument();
    expect(paths[0]).toHaveAttribute("tabindex", "0");
    expect(paths[0]).toHaveAccessibleName(/€/);
    rerender(<MapView {...props} layer="dpe" classes={indicatorClasses.dpe} />);
    expect(container.querySelectorAll('path[role="button"]')).toHaveLength(32);
    expect(container.querySelector('path[role="button"]')).toBe(paths[0]);
    expect(paths[0]).toHaveAccessibleName(/%/);
  });

  it("hachure les valeurs null et fournit le libellé dans la légende", async () => {
    const { container } = await renderMap();
    const path = container.querySelector('[data-code="59005"]');
    expect(path).toHaveAttribute("fill", expect.stringContaining("url(#no-data-"));
    expect(path).toHaveAccessibleName(/Pas de donnée/);
    expect(screen.getByText("Pas de donnée")).toBeInTheDocument();
    expect(container.querySelector("pattern")).toBeInTheDocument();
  });

  it("sélectionne par clic, Entrée et Espace avec le même identifiant que la liste", async () => {
    const onSelect = vi.fn();
    const { container, rerender, props, MapView } = await renderMap({ onSelect });
    const path = container.querySelector<SVGElement>('[data-code="59001"]')!;
    act(() => { path.focus(); });
    expect(path).toHaveFocus();
    fireEvent.click(path); fireEvent.keyDown(path, { key: "Enter" }); fireEvent.keyDown(path, { key: " " });
    expect(onSelect.mock.calls).toEqual([["59001"], ["59001"], ["59001"]]);
    rerender(<MapView {...props} selection={["59001"]} />);
    expect(path).toHaveAttribute("aria-pressed", "true");
    expect(path).toHaveAttribute("stroke-width", "4");
    expect(container.querySelectorAll(".leaflet-marker-icon")).toHaveLength(1);
    expect(path).toHaveFocus();
    expect(screen.getByRole("status")).toHaveTextContent("Commune sélectionnée : Bois-des-Aulnes");
  });

  it("écarte les géométries null et hors périmètre", async () => {
    const { container } = await renderMap({ municipalities: [{ ...municipalities[0], geometry: null }, { ...municipalities[1], isInPerimeter: false }, municipalities[2]] });
    expect(container.querySelectorAll('path[role="button"]')).toHaveLength(1);
    expect(container.querySelector('[data-code="59003"]')).toBeInTheDocument();
  });

  it("affiche le chargement ou une erreur 503 sans carte vide de substitution", async () => {
    const { container, rerender, props, MapView } = await renderMap({ isLoading: true });
    expect(screen.getByRole("status")).toHaveTextContent("Chargement");
    expect(container.querySelector(".leaflet-container")).not.toBeInTheDocument();
    const onRetry = vi.fn();
    rerender(<MapView {...props} isLoading={false} error={{ status: 503, message: "Service indisponible" }} onRetry={onRetry} />);
    expect(screen.getByRole("alert")).toHaveTextContent("503");
    fireEvent.click(screen.getByRole("button", { name: "Réessayer" }));
    expect(onRetry).toHaveBeenCalledOnce();
    expect(container.querySelector(".leaflet-container")).not.toBeInTheDocument();
  });

  it("remplace un fond de carte en panne par ApiErrorState et permet de réessayer", async () => {
    const L = await import("leaflet");
    const spy = vi.spyOn(L.TileLayer.prototype, "addTo");
    await renderMap({ tileUrl: "https://tiles.example.test/{z}/{x}/{y}.png" });
    const tileLayer = spy.mock.contexts[0] as TileLayer;
    act(() => { tileLayer.fire("tileerror"); });
    expect(screen.getByRole("alert")).toHaveTextContent("503");
    fireEvent.click(screen.getByRole("button", { name: "Réessayer" }));
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
    spy.mockRestore();
  });
});
