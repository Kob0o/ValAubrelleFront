import { fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { ReportsDemo } from "@/app/dev/reports/reports-demo";

describe("ReportsDemo", () => {
  it("simule une modification concurrente : 409, puis rechargement de la nouvelle version", async () => {
    render(<ReportsDemo latency={0} />);

    const nav = await screen.findByRole("navigation", {
      name: "Sections du rapport",
    });
    fireEvent.click(within(nav).getByRole("button", { name: /Parc de logements vacants/ }));
    fireEvent.click(screen.getByLabelText("Modification concurrente (409)"));

    fireEvent.change(screen.getByLabelText("Texte"), {
      target: { value: "Texte relu" },
    });
    fireEvent.click(
      screen.getByRole("button", { name: "Enregistrer les modifications" }),
    );

    expect(await screen.findByRole("alert")).toHaveTextContent(
      /modifiées entre-temps/,
    );
    fireEvent.click(screen.getByRole("button", { name: "Recharger la section" }));

    await waitFor(() =>
      expect(screen.getByRole("status")).toHaveTextContent(
        "Dernière version rechargée",
      ),
    );
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
    expect(screen.getByLabelText("Texte")).toHaveValue("Texte relu");

    // Sans simulation, l'enregistrement passe avec la version rechargée.
    fireEvent.click(screen.getByLabelText("Succès"));
    fireEvent.click(
      screen.getByRole("button", { name: "Enregistrer les modifications" }),
    );
    await waitFor(() =>
      expect(screen.getByRole("status")).toHaveTextContent(
        "Modifications enregistrées.",
      ),
    );
  });
});
