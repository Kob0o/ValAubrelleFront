import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import {
  DataTable,
  type DataTableColumn,
} from "@/components/shared/data-table/data-table";
import {
  nextSortState,
  parseSortString,
  toSortString,
} from "@/components/shared/data-table/types";
import {
  municipalities,
  type MunicipalityFixture,
} from "@/mocks/municipalities";

const columns: DataTableColumn<MunicipalityFixture>[] = [
  {
    accessorKey: "name",
    header: "Nom",
    meta: { sortable: true, sortField: "name" },
  },
  { accessorKey: "inseeCode", header: "Code INSEE" },
  {
    accessorKey: "population",
    header: "Population",
    meta: { numeric: true, sortable: true, sortField: "population" },
  },
  {
    accessorKey: "qualityScore",
    header: "Score qualité",
    meta: { numeric: true },
  },
  {
    accessorKey: "openRequests",
    header: "Demandes",
    meta: { numeric: true },
  },
];

const CAPTION = "Liste des communes du Val d'Aubrelle";

function renderDataTable(
  props: Partial<Parameters<typeof DataTable<MunicipalityFixture>>[0]> = {},
) {
  return render(
    <DataTable columns={columns} rows={municipalities} caption={CAPTION} {...props} />,
  );
}

describe("DataTable — état « données »", () => {
  it("annonce la légende du tableau comme nom accessible", () => {
    renderDataTable();
    expect(
      screen.getByRole("table", { name: CAPTION }),
    ).toBeInTheDocument();
  });

  it("expose les en-têtes avec scope col et le bon nombre de lignes", () => {
    renderDataTable();

    const headers = screen.getAllByRole("columnheader");
    expect(headers).toHaveLength(columns.length);
    for (const header of headers) {
      expect(header).toHaveAttribute("scope", "col");
    }

    // 1 ligne d'en-tête + 1 ligne par commune.
    expect(screen.getAllByRole("row")).toHaveLength(1 + municipalities.length);
  });

  it("n'affiche jamais 0 pour une valeur null, mais affiche un vrai 0", () => {
    renderDataTable();

    // Brumecourt : population null → « — », demandes = 0 (vrai zéro) → « 0 ».
    const row = screen.getByRole("row", { name: /Brumecourt/ });
    expect(row).toHaveTextContent("—");
    expect(row).toHaveTextContent("0");

    // Valmont-sur-Lys : score qualité null → « — ».
    expect(
      screen.getByRole("row", { name: /Valmont-sur-Lys/ }),
    ).toHaveTextContent("—");
  });

  it("aligne les cellules numériques à droite", () => {
    renderDataTable();
    const populationCell = screen.getByText("12480").closest("td");
    expect(populationCell).toHaveClass("text-right");

    const nameCell = screen.getByText("Aubrelle").closest("td");
    expect(nameCell).not.toHaveClass("text-right");
  });
});

describe("DataTable — états chargement, vide et erreur", () => {
  it("affiche le Skeleton pendant le chargement, sans le tableau", () => {
    renderDataTable({ loading: true });

    const status = screen.getByRole("status");
    expect(status).toHaveAttribute("aria-busy", "true");
    expect(status).toHaveTextContent("Chargement des données…");
    expect(screen.queryByRole("table")).not.toBeInTheDocument();
  });

  it("affiche l'EmptyState quand il n'y a aucune ligne", () => {
    renderDataTable({ rows: [] });

    expect(screen.getByRole("status")).toHaveTextContent(
      "Aucune donnée à afficher",
    );
    expect(screen.queryByRole("table")).not.toBeInTheDocument();
  });

  it("permet de forcer l'état vide via la prop empty", () => {
    renderDataTable({ empty: true });
    expect(screen.getByRole("status")).toHaveTextContent(
      "Aucune donnée à afficher",
    );
  });

  it("affiche l'erreur avec role alert", () => {
    renderDataTable({ error: "Le serveur ne répond pas." });

    expect(screen.getByRole("alert")).toHaveTextContent(
      "Le serveur ne répond pas.",
    );
    expect(screen.queryByRole("table")).not.toBeInTheDocument();
  });
});

describe("DataTable — tri contrôlé par le parent", () => {
  it("émet la chaîne du contrat « champ,asc » au clic sur un en-tête triable", () => {
    const onSortChange = vi.fn();
    renderDataTable({ onSortChange });

    fireEvent.click(screen.getByRole("button", { name: /Trier par Nom/ }));
    expect(onSortChange).toHaveBeenCalledWith("name,asc");
  });

  it("bascule en « champ,desc » quand la colonne est déjà triée asc", () => {
    const onSortChange = vi.fn();
    renderDataTable({
      onSortChange,
      sort: { field: "name", direction: "asc" },
    });

    fireEvent.click(screen.getByRole("button", { name: /Trier par Nom/ }));
    expect(onSortChange).toHaveBeenCalledWith("name,desc");
  });

  it("est utilisable au clavier : le contrôle de tri est un bouton natif", () => {
    renderDataTable({ onSortChange: vi.fn() });

    // Un <button> est focusable et activable à Entrée/Espace nativement.
    const sortButton = screen.getByRole("button", { name: /Trier par Nom/ });
    expect(sortButton.tagName).toBe("BUTTON");
    sortButton.focus();
    expect(sortButton).toHaveFocus();
  });

  it("met aria-sort à jour sur la colonne triée", () => {
    const { rerender } = render(
      <DataTable
        columns={columns}
        rows={municipalities}
        caption={CAPTION}
        onSortChange={vi.fn()}
        sort={{ field: "name", direction: "asc" }}
      />,
    );

    expect(
      screen.getByRole("columnheader", { name: /Nom/ }),
    ).toHaveAttribute("aria-sort", "ascending");
    expect(
      screen.getByRole("columnheader", { name: /Population/ }),
    ).toHaveAttribute("aria-sort", "none");

    rerender(
      <DataTable
        columns={columns}
        rows={municipalities}
        caption={CAPTION}
        onSortChange={vi.fn()}
        sort={{ field: "name", direction: "desc" }}
      />,
    );
    expect(
      screen.getByRole("columnheader", { name: /Nom/ }),
    ).toHaveAttribute("aria-sort", "descending");
  });

  it("ne rend pas les colonnes non triables interactives", () => {
    renderDataTable({ onSortChange: vi.fn() });

    const header = screen.getByRole("columnheader", { name: "Code INSEE" });
    expect(header).not.toHaveAttribute("aria-sort");
    expect(
      screen.queryByRole("button", { name: /Code INSEE/ }),
    ).not.toBeInTheDocument();
  });
});

describe("DataTable — lignes cliquables et sélection", () => {
  it("déclenche onRowClick au clic souris", () => {
    const onRowClick = vi.fn();
    renderDataTable({ onRowClick });

    fireEvent.click(screen.getByRole("row", { name: /Aubrelle/ }));
    expect(onRowClick).toHaveBeenCalledWith(
      expect.objectContaining({ id: "aubrelle" }),
    );
  });

  it("déclenche onRowClick au clavier (Entrée et Espace)", () => {
    const onRowClick = vi.fn();
    renderDataTable({ onRowClick });

    const row = screen.getByRole("row", { name: /Valmont-sur-Lys/ });
    fireEvent.keyDown(row, { key: "Enter" });
    fireEvent.keyDown(row, { key: " " });

    expect(onRowClick).toHaveBeenCalledTimes(2);
    expect(onRowClick).toHaveBeenCalledWith(
      expect.objectContaining({ id: "valmont-sur-lys" }),
    );
  });

  it("marque la ligne sélectionnée avec aria-selected et un marqueur visuel", () => {
    renderDataTable({
      onRowClick: vi.fn(),
      selectedId: "la-clairiere",
    });

    const selected = screen.getByRole("row", { name: /La Clairière/ });
    expect(selected).toHaveAttribute("aria-selected", "true");
    expect(selected).toHaveAttribute("data-state", "selected");
    // Marqueur Vert Aubrelle : bordure intérieure, pas la couleur seule.
    expect(selected.className).toContain("shadow-[inset_4px_0_0_0");

    const other = screen.getByRole("row", { name: /Aubrelle/ });
    expect(other).toHaveAttribute("aria-selected", "false");
    expect(other).not.toHaveAttribute("data-state");
  });
});

describe("DataTable — helpers du contrat de tri", () => {
  it("toSortString produit le format « champ,direction »", () => {
    expect(toSortString({ field: "name", direction: "asc" })).toBe("name,asc");
    expect(toSortString({ field: "population", direction: "desc" })).toBe(
      "population,desc",
    );
  });

  it("parseSortString lit le format du contrat et rejette l'invalide", () => {
    expect(parseSortString("name,asc")).toEqual({
      field: "name",
      direction: "asc",
    });
    expect(parseSortString("population,desc")).toEqual({
      field: "population",
      direction: "desc",
    });
    expect(parseSortString("name,sideways")).toBeNull();
    expect(parseSortString("")).toBeNull();
    expect(parseSortString(null)).toBeNull();
    expect(parseSortString(undefined)).toBeNull();
  });

  it("nextSortState démarre en asc puis bascule", () => {
    expect(nextSortState(null, "name")).toEqual({
      field: "name",
      direction: "asc",
    });
    expect(
      nextSortState({ field: "name", direction: "asc" }, "name"),
    ).toEqual({ field: "name", direction: "desc" });
    expect(
      nextSortState({ field: "name", direction: "desc" }, "population"),
    ).toEqual({ field: "population", direction: "asc" });
  });
});
