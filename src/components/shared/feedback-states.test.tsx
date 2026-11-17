import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { EmptyState } from "@/components/shared/empty-state";
import { Skeleton } from "@/components/shared/skeleton";
import { axeViolations } from "@/test/axe";

describe("Skeleton", () => {
  it("est décoratif (aria-hidden) et animé seulement si le mouvement est accepté", () => {
    const { container } = render(<Skeleton shape="block" />);
    const skeleton = container.firstElementChild!;
    expect(skeleton).toHaveAttribute("aria-hidden", "true");
    expect(skeleton).toHaveClass("motion-safe:animate-pulse");
  });

  it("shape='cell' fait 44 px de haut (zone tactile minimale)", () => {
    const { container } = render(<Skeleton shape="cell" />);
    expect(container.firstElementChild).toHaveClass("h-11");
  });

  it("shape='line' avec lines rend le nombre de lignes demandé", () => {
    const { container } = render(<Skeleton shape="line" lines={3} />);
    expect(container.firstElementChild).toHaveAttribute("aria-hidden", "true");
    expect(container.firstElementChild!.children).toHaveLength(3);
  });

  it("accepte un className libre (usage DataTable)", () => {
    const { container } = render(<Skeleton className="h-11 w-full" />);
    expect(container.firstElementChild).toHaveClass("h-11", "w-full");
  });
});

describe("EmptyState", () => {
  it("a un titre par défaut et le rôle status", () => {
    render(<EmptyState />);
    expect(screen.getByRole("status")).toHaveTextContent(
      "Aucune donnée à afficher",
    );
  });

  it("rend titre, description et action", () => {
    const onReset = vi.fn();
    render(
      <EmptyState
        title="Aucun résultat"
        description="Élargissez votre recherche."
        action={<button onClick={onReset}>Réinitialiser les filtres</button>}
      />,
    );

    expect(screen.getByText("Aucun résultat")).toBeInTheDocument();
    expect(
      screen.getByText("Élargissez votre recherche."),
    ).toBeInTheDocument();
    fireEvent.click(
      screen.getByRole("button", { name: "Réinitialiser les filtres" }),
    );
    expect(onReset).toHaveBeenCalledOnce();
  });

  it("le pictogramme est décoratif (aria-hidden)", () => {
    const { container } = render(<EmptyState title="Vide" />);
    expect(container.querySelector("svg")).toHaveAttribute(
      "aria-hidden",
      "true",
    );
  });

  it("aucune violation axe", async () => {
    render(
      <EmptyState
        title="Aucun résultat"
        description="Élargissez votre recherche."
        action={<button>Réinitialiser les filtres</button>}
      />,
    );
    expect(await axeViolations()).toEqual([]);
  });
});
