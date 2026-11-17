import { fireEvent, render, screen, within } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { SectionList } from "@/components/reports/section-list";
import { mockReportDraft } from "@/mocks/report-draft";

const { sections } = mockReportDraft;
const [, , third] = sections;

describe("SectionList", () => {
  it("affiche un état vide explicite", () => {
    render(<SectionList sections={[]} onSelect={vi.fn()} />);
    expect(screen.getByText(/Aucune section/)).toBeInTheDocument();
    expect(screen.queryByRole("navigation")).not.toBeInTheDocument();
  });

  it("affiche des compteurs en texte qui correspondent aux sections affichées", () => {
    render(<SectionList sections={sections} onSelect={vi.fn()} />);

    const counters = within(
      screen.getByRole("list", { name: "Répartition par statut" }),
    );
    expect(counters.getByText("2 à revoir")).toBeInTheDocument();
    expect(counters.getByText("1 acceptée")).toBeInTheDocument();
    expect(counters.getByText("1 modifiée")).toBeInTheDocument();
    expect(counters.getByText("1 exclue")).toBeInTheDocument();
    expect(screen.getByText("5 sections")).toBeInTheDocument();

    const items = within(
      screen.getByRole("navigation", { name: "Sections du rapport" }),
    ).getAllByRole("button");
    expect(items).toHaveLength(sections.length);
    const shownToReview = items.filter(
      (item) => item.querySelector('[data-status="to_review"]') !== null,
    );
    expect(shownToReview).toHaveLength(2);
  });

  it("affiche chaque statut par son libellé, pas seulement par sa couleur", () => {
    render(<SectionList sections={sections} onSelect={vi.fn()} />);
    const nav = within(screen.getByRole("navigation"));
    expect(nav.getAllByText("À revoir")).toHaveLength(2);
    expect(nav.getByText("Acceptée")).toBeInTheDocument();
    expect(nav.getByText("Modifiée")).toBeInTheDocument();
    expect(nav.getByText("Exclue")).toBeInTheDocument();
  });

  it("annonce la section active aux lecteurs d'écran (aria-current)", () => {
    render(
      <SectionList sections={sections} activeId={third.id} onSelect={vi.fn()} />,
    );
    const active = screen.getByRole("button", { current: true });
    expect(active).toHaveTextContent("Bilan de l'OPAH précédente");
    expect(active).toHaveAttribute("aria-current", "true");
    expect(screen.getAllByRole("button", { current: false })).toHaveLength(4);
  });

  it("trie les sections par ordre", () => {
    const shuffled = [...sections].reverse();
    render(<SectionList sections={shuffled} onSelect={vi.fn()} />);
    const titles = screen
      .getAllByRole("button")
      .map((button) => button.textContent);
    expect(titles[0]).toContain("Contexte du territoire");
    expect(titles[4]).toContain("Annexe technique");
  });

  it("se parcourt au clavier et sélectionne au clic / Entrée", () => {
    const onSelect = vi.fn();
    render(<SectionList sections={sections} onSelect={onSelect} />);
    const buttons = screen.getAllByRole("button");

    buttons[0].focus();
    fireEvent.keyDown(buttons[0], { key: "ArrowDown" });
    expect(buttons[1]).toHaveFocus();

    fireEvent.keyDown(buttons[1], { key: "End" });
    expect(buttons[4]).toHaveFocus();

    fireEvent.keyDown(buttons[4], { key: "ArrowDown" });
    expect(buttons[4]).toHaveFocus();

    fireEvent.keyDown(buttons[4], { key: "Home" });
    expect(buttons[0]).toHaveFocus();

    fireEvent.keyDown(buttons[0], { key: "ArrowUp" });
    expect(buttons[0]).toHaveFocus();

    // Entrée sur un <button> déclenche un clic natif.
    fireEvent.click(buttons[2]);
    expect(onSelect).toHaveBeenCalledWith(third.id);
  });
});
