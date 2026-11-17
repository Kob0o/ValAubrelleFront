import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { Banner } from "@/components/shared/banner";
import { axeViolations } from "@/test/axe";

describe("Banner", () => {
  it("porte l'information par l'icône ET le texte (jamais la couleur seule)", () => {
    const { container } = render(
      <Banner kind="warning" title="Données partielles">
        3 communes n’ont pas transmis leurs données.
      </Banner>,
    );

    expect(screen.getByText("Données partielles")).toBeInTheDocument();
    expect(
      screen.getByText("3 communes n’ont pas transmis leurs données."),
    ).toBeInTheDocument();
    // L'icône est décorative : non annoncée, le titre porte le sens.
    expect(container.querySelector("svg")).toHaveAttribute(
      "aria-hidden",
      "true",
    );
  });

  it("est statique par défaut (pas de rôle live)", () => {
    render(<Banner kind="info" title="Information" />);
    expect(screen.getByText("Information")).not.toHaveAttribute("role");
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
    expect(screen.queryByRole("status")).not.toBeInTheDocument();
  });

  it("live='assertive' → role='alert' (erreur après une action)", () => {
    render(
      <Banner kind="error" title="Échec de l'enregistrement" live="assertive" />,
    );
    expect(screen.getByRole("alert")).toHaveTextContent(
      "Échec de l'enregistrement",
    );
  });

  it("live='polite' → role='status'", () => {
    render(<Banner kind="success" title="Export terminé" live="polite" />);
    expect(screen.getByRole("status")).toHaveTextContent("Export terminé");
  });

  it("le bouton Fermer a un libellé accessible et appelle onClose", () => {
    const onClose = vi.fn();
    render(<Banner kind="info" title="Avis" onClose={onClose} />);

    fireEvent.click(screen.getByRole("button", { name: "Fermer" }));
    expect(onClose).toHaveBeenCalledOnce();
  });

  it("rend l'action sous le texte", () => {
    render(
      <Banner kind="warning" title="Avis" action={<button>Voir le détail</button>} />,
    );
    expect(
      screen.getByRole("button", { name: "Voir le détail" }),
    ).toBeInTheDocument();
  });

  it("aucune violation axe sur les quatre variantes", async () => {
    render(
      <div>
        <Banner kind="info" title="Information">
          Détail.
        </Banner>
        <Banner kind="success" title="Succès" live="polite" />
        <Banner kind="warning" title="Avertissement" />
        <Banner kind="error" title="Erreur" live="assertive" />
      </div>,
    );
    expect(await axeViolations()).toEqual([]);
  });
});
