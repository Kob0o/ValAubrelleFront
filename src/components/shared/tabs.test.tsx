import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it } from "vitest";

import { Tabs, type TabItem } from "@/components/shared/tabs";

const items: TabItem[] = [
  { value: "synthese", label: "Synthèse", content: "Panneau synthèse" },
  { value: "indicateurs", label: "Indicateurs", content: "Panneau indicateurs" },
  { value: "sources", label: "Sources", content: "Panneau sources", disabled: true },
  { value: "rapports", label: "Rapports", content: "Panneau rapports" },
];

afterEach(() => {
  cleanup();
  window.history.replaceState(null, "", "/");
});

describe("Tabs", () => {
  it("nomme la liste et marque l'onglet actif par la graisse et le trait", () => {
    render(<Tabs items={items} label="Fiche commune" />);

    expect(screen.getByRole("tablist", { name: "Fiche commune" })).toBeInTheDocument();
    const active = screen.getByRole("tab", { name: "Synthèse" });
    expect(active).toHaveAttribute("aria-selected", "true");
    expect(active).toHaveClass("data-active:font-semibold", "after:bg-primary");
    expect(screen.getByRole("tabpanel")).toHaveTextContent("Panneau synthèse");
  });

  it("se pilote aux flèches, Début et Fin en sautant l'onglet désactivé", async () => {
    const user = userEvent.setup();
    render(<Tabs items={items} label="Fiche commune" />);

    await user.tab();
    expect(screen.getByRole("tab", { name: "Synthèse" })).toHaveFocus();

    await user.keyboard("{ArrowRight}");
    expect(screen.getByRole("tab", { name: "Indicateurs" })).toHaveFocus();
    expect(screen.getByRole("tabpanel")).toHaveTextContent("Panneau indicateurs");

    await user.keyboard("{ArrowRight}");
    expect(screen.getByRole("tab", { name: "Rapports" })).toHaveFocus();

    await user.keyboard("{Home}");
    expect(screen.getByRole("tab", { name: "Synthèse" })).toHaveFocus();

    await user.keyboard("{End}");
    expect(screen.getByRole("tab", { name: "Rapports" })).toHaveFocus();

    await user.tab();
    expect(screen.getByRole("tabpanel")).toHaveFocus();
  });

  it("écrit l'onglet dans l'URL avec syncWithUrl", async () => {
    const user = userEvent.setup();
    render(<Tabs items={items} label="Fiche commune" syncWithUrl />);

    await user.click(screen.getByRole("tab", { name: "Rapports" }));
    expect(new URLSearchParams(window.location.search).get("onglet")).toBe("rapports");
  });

  it("restaure l'onglet de l'URL au chargement, sauf s'il est désactivé", () => {
    window.history.replaceState(null, "", "/?onglet=indicateurs");
    render(<Tabs items={items} label="Fiche commune" syncWithUrl />);
    expect(screen.getByRole("tab", { name: "Indicateurs" })).toHaveAttribute(
      "aria-selected",
      "true",
    );
    cleanup();

    window.history.replaceState(null, "", "/?onglet=sources");
    render(<Tabs items={items} label="Fiche commune" syncWithUrl />);
    expect(screen.getByRole("tab", { name: "Synthèse" })).toHaveAttribute(
      "aria-selected",
      "true",
    );
  });
});
