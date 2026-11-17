import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it } from "vitest";

import { Breadcrumb } from "@/components/shared/breadcrumb";

afterEach(() => {
  cleanup();
});

const items = [
  { label: "Accueil", href: "/" },
  { label: "Communes", href: "/communes" },
  { label: "Brévannes", href: "/communes/brevannes" },
];

describe("Breadcrumb", () => {
  it("expose un nav nommé, une liste ordonnée et la page courante", () => {
    render(<Breadcrumb items={items} current="Indicateurs" />);

    const nav = screen.getByRole("navigation", { name: "Fil d'Ariane" });
    expect(nav.querySelector("ol")).not.toBeNull();

    const current = screen.getByText("Indicateurs");
    expect(current).toHaveAttribute("aria-current", "page");
    expect(current.closest("a")).toBeNull();
    expect(screen.getByRole("link", { name: "Communes" })).toHaveAttribute(
      "href",
      "/communes",
    );
  });

  it("masque les séparateurs aux lecteurs d'écran", () => {
    const { container } = render(<Breadcrumb items={items} current="Indicateurs" />);
    const separators = container.querySelectorAll('[data-slot="breadcrumb-separator"]');
    expect(separators.length).toBeGreaterThan(0);
    for (const separator of separators) {
      expect(separator).toHaveAttribute("aria-hidden", "true");
    }
  });

  it("replie les niveaux intermédiaires derrière un bouton accessible", async () => {
    const user = userEvent.setup();
    render(<Breadcrumb items={items} current="Indicateurs" />);

    const middle = screen.getByRole("link", { name: "Communes" }).closest("li");
    expect(middle).toHaveClass("hidden", "sm:inline-flex");

    await user.click(
      screen.getByRole("button", { name: "Afficher les 2 niveaux intermédiaires" }),
    );

    expect(middle).not.toHaveClass("hidden");
    expect(
      screen.queryByRole("button", { name: /niveaux intermédiaires/ }),
    ).not.toBeInTheDocument();
  });

  it("n'affiche pas de bouton « … » sans niveau intermédiaire", () => {
    render(<Breadcrumb items={[items[0]]} current="Communes" />);
    expect(screen.queryByRole("button")).not.toBeInTheDocument();
  });
});
