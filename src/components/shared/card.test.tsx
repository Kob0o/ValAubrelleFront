import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  InteractiveCardAction,
} from "@/components/shared/card";

describe("Card", () => {
  it("affiche la sélection visuelle sans aria-current sur le conteneur", () => {
    render(
      <Card selected>
        <CardHeader>
          <CardTitle>Aubrecourt</CardTitle>
        </CardHeader>
        <CardContent>Fiche commune</CardContent>
      </Card>,
    );

    const card = screen.getByText("Aubrecourt").closest("[data-slot='card']");
    expect(card).toHaveAttribute("data-selected", "true");
    expect(card).not.toHaveAttribute("aria-current");
    expect(screen.getByText("Sélectionnée")).toBeInTheDocument();
  });

  it("couvre la carte interactive avec un seul lien principal", () => {
    render(
      <Card variant="interactive">
        <CardHeader>
          <CardTitle as="h2">Rivelle</CardTitle>
        </CardHeader>
        <CardContent>Voir la fiche</CardContent>
        <InteractiveCardAction href="/communes/59242">
          Ouvrir Rivelle
        </InteractiveCardAction>
      </Card>,
    );

    expect(
      screen.getByRole("link", { name: "Ouvrir Rivelle" }),
    ).toHaveAttribute("href", "/communes/59242");
    expect(
      screen.getByRole("heading", { level: 2, name: "Rivelle" }),
    ).toBeInTheDocument();
  });

  it("combine interactive et selected avec aria-current sur l'action", () => {
    render(
      <Card variant="interactive" selected>
        <CardHeader>
          <CardTitle>Bellemont</CardTitle>
        </CardHeader>
        <CardContent>Commune sélectionnée</CardContent>
        <InteractiveCardAction href="/communes/59233">
          Ouvrir Bellemont
        </InteractiveCardAction>
      </Card>,
    );

    const link = screen.getByRole("link", { name: "Ouvrir Bellemont" });
    expect(link).toHaveAttribute("aria-current", "true");

    const card = screen.getByText("Bellemont").closest("[data-slot='card']");
    expect(card).toHaveAttribute("data-variant", "interactive");
    expect(card).toHaveAttribute("data-selected", "true");
    expect(card).not.toHaveAttribute("aria-current");
    expect(card).toHaveTextContent("Sélectionnée");
  });
});

