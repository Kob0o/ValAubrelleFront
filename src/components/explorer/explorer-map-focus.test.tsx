import { act, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { expect, it, vi } from "vitest";
import type { ExplorerDataSource } from "@/api-mock/explorer/types";
import { defaultExplorerQuery, mockExplorerDataSource } from "@/mocks/explorer";
import { ExplorerPrototype } from "./explorer-prototype";

vi.mock("maplibre-gl", async () => (await import("@/test/maplibre-mock")).mapLibreMock);

// Le hook asynchrone, l’adaptateur et le contrôleur de carte restent réels.
vi.mock("./map-view/map-view-loader", async () => ({
  MapView: (await import("./map-view/map-view")).default,
}));

it("garde le focus sur la commune sélectionnée au clavier en 2022 après une nouvelle réponse complète", async () => {
  vi.spyOn(HTMLElement.prototype, "clientWidth", "get").mockReturnValue(800);
  vi.spyOn(HTMLElement.prototype, "clientHeight", "get").mockReturnValue(620);
  const releases: (() => void)[] = [];
  const source = vi.fn<ExplorerDataSource>(async (query, options) => {
    // Simuler un vrai JSON HTTP : tous les objets sont nouveaux à chaque réponse.
    const response = structuredClone(await mockExplorerDataSource(query, options));
    if (query.municipalityCode === "59002") {
      return new Promise<typeof response>((resolve) => { releases.push(() => resolve(response)); });
    }
    return response;
  });
  const user = userEvent.setup();
  try {
    const { container } = render(<ExplorerPrototype dataSource={source} initialQuery={{ ...defaultExplorerQuery, year: 2022, startYear: 2022, endYear: 2022 }} />);
    await waitFor(() => expect(container.querySelectorAll('button[data-code]')).toHaveLength(32));
    const municipality = container.querySelector<HTMLButtonElement>('[data-code="59002"]')!;
    act(() => municipality.focus());
    await user.keyboard("{Enter}");
    await waitFor(() => expect(releases.length).toBeGreaterThan(0));
    await act(async () => { releases.splice(0).forEach((release) => release()); });
    expect(source.mock.lastCall?.[0]).toMatchObject({ municipalityCode: "59002", selection: ["59002"], year: 2022 });
    expect(screen.getByRole("heading", { name: "Montclair" })).toBeInTheDocument();
    expect(container.querySelector('[data-code="59002"]')).toBe(municipality);
    expect(municipality).toHaveFocus();
    expect(municipality).toHaveAttribute("aria-pressed", "true");
    await user.tab();
    const next = container.querySelector('[data-code="59003"]');
    expect(next).toHaveFocus();
    await user.keyboard(" ");
    await screen.findByRole("heading", { name: "La Clairière" });
    expect(container.querySelector('[data-code="59003"]')).toBe(next);
    expect(next).toHaveFocus();
    expect(next).toHaveAttribute("aria-pressed", "true");
  } finally {
    vi.restoreAllMocks();
  }
});
