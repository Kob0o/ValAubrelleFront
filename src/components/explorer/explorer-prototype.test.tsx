import { act, cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeAll, describe, expect, it, vi } from "vitest";
import type { ExplorerDataSource, ExplorerResponse } from "@/api-mock/explorer/types";
import { ExplorerRequestError } from "@/api-mock/explorer/data-source";
import { defaultExplorerQuery, mockExplorerDataSource, mockExplorerResponse } from "@/mocks/explorer";
import type { MapViewProps } from "./map-view/types";
import { ExplorerPrototype } from "./explorer-prototype";

// Le moteur SVG réel est vérifié séparément ; ici on vérifie filtre, requête et données transmises.
vi.mock("./map-view/map-view-loader", () => ({
  MapView: ({ values, selection, layer, isLoading }: MapViewProps) => <output data-testid="map-data">{JSON.stringify({ values, selection, layer, isLoading })}</output>,
}));

beforeAll(() => {
  vi.stubGlobal("matchMedia", vi.fn(() => ({ matches: false, addEventListener() {}, removeEventListener() {} })));
});
afterEach(cleanup);

const snapshot = () => JSON.parse(screen.getByTestId("map-data").textContent!);

describe("filtre annuel de l’explorateur", () => {
  it("indique la source et permet de rétablir la liste après une recherche sans résultat", async () => {
    render(<ExplorerPrototype />);
    expect(screen.getByText(/Source : Démonstration locale/)).toBeInTheDocument();
    await waitFor(() => expect(screen.getByRole("combobox", { name: "Année" })).toBeEnabled());
    const search = screen.getByRole("searchbox", { name: "Rechercher une commune" });
    fireEvent.change(search, { target: { value: "aucune-commune-xyz" } });
    expect(screen.getByText("0 commune sur 32")).toBeInTheDocument();
    expect(screen.getByText("Aucune commune ne correspond à votre recherche.")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Effacer la recherche" }));
    expect(search).toHaveValue("");
    expect(screen.getByText("32 communes sur 32")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Bois-des-Aulnes/ })).toHaveAttribute("aria-pressed", "true");
  });

  it("actualise la carte et la fiche, conserve la sélection et transmet l’année sur la couche DPE", async () => {
    const source = vi.fn<ExplorerDataSource>(mockExplorerDataSource);
    render(<ExplorerPrototype dataSource={source} />);
    const select = screen.getByRole("combobox", { name: "Année" });
    await waitFor(() => expect(select).toBeEnabled());
    expect(select).toHaveValue("2026");
    expect(screen.getAllByRole("option").map((option) => option.textContent)).toEqual(["2026", "2025", "2024", "2023", "2022"]);
    fireEvent.change(select, { target: { value: "2022" } });
    await waitFor(() => expect(snapshot().values.find((item: { municipalityCode: string; layer: string }) => item.municipalityCode === "59001" && item.layer === "price")?.value).toBe(1184));
    expect(source.mock.lastCall?.[0]).toMatchObject({ year: 2022, startYear: 2022, endYear: 2022, municipalityCode: "59001" });
    expect(snapshot().selection).toEqual(["59001"]);
    expect(screen.getByText("Prix moyen · 2022")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "DPE F + G" }));
    await waitFor(() => expect(source.mock.lastCall?.[0]).toMatchObject({ layer: "dpe", year: 2022 }));
    expect(select).toHaveValue("2022");
    expect(snapshot().values.find((item: { municipalityCode: string; layer: string }) => item.municipalityCode === "59001" && item.layer === "dpe")?.value).toBe(41);
  });

  it("utilise les années de la réponse et désactive celles sans donnée", async () => {
    const source: ExplorerDataSource = async () => ({ ...mockExplorerResponse, years: [{ year: 2026, hasData: true }, { year: 2025, hasData: false }] });
    render(<ExplorerPrototype dataSource={source} />);
    await waitFor(() => expect(screen.getByRole("combobox", { name: "Année" })).toBeEnabled());
    expect(screen.getAllByRole("option")).toHaveLength(2);
    expect(screen.getByRole("option", { name: "2025 — Pas de donnée" })).toBeDisabled();
  });

  it("masque les valeurs de l’ancienne année pendant le chargement et garde le filtre utilisable après un échec", async () => {
    let rejectYear!: (error: Error) => void;
    const source = vi.fn<ExplorerDataSource>().mockResolvedValueOnce(mockExplorerResponse).mockImplementationOnce(() => new Promise<ExplorerResponse>((_resolve, reject) => { rejectYear = reject; })).mockImplementation(mockExplorerDataSource);
    render(<ExplorerPrototype dataSource={source} />);
    const select = screen.getByRole("combobox", { name: "Année" });
    await waitFor(() => expect(select).toBeEnabled());
    fireEvent.change(select, { target: { value: "2022" } });
    await waitFor(() => expect(source).toHaveBeenCalledTimes(2));
    expect(snapshot()).toMatchObject({ values: [], isLoading: true });
    expect(screen.queryByText("Prix moyen · 2022")).not.toBeInTheDocument();
    await act(async () => rejectYear(new ExplorerRequestError(503, { code: "SERVICE_UNAVAILABLE", message: "Service indisponible" })));
    expect(select).toBeEnabled();
    expect(screen.getAllByRole("option")).toHaveLength(5);
    fireEvent.change(select, { target: { value: "2026" } });
    await waitFor(() => expect(snapshot().values).toHaveLength(64));
    expect(source.mock.lastCall?.[0].year).toBe(defaultExplorerQuery.year);
  });
});
