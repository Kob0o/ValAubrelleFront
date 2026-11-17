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
  it("annonce la sélection avec aria-current et un libellé visible", () => {
    render(
      <Card variant="selected">
        <CardHeader>
          <CardTitle>Aubrecourt</CardTitle>
        </CardHeader>
        <CardContent>Fiche commune</CardContent>
      </Card>,
    );

    const card = screen.getByText("Aubrecourt").closest("[data-slot='card']");
    expect(card).toHaveAttribute("aria-current", "true");
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
    expect(screen.getByRole("heading", { level: 2, name: "Rivelle" })).toBeInTheDocument();
  });
});
