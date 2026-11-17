import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import {
  DataTable,
  nextSortState,
  parseSortString,
  toSortString,
  type DataTableColumn,
} from "@/components/shared/data-table";
import { mockIndicatorValues } from "@/mocks/quality-status";
import type { IndicatorValue } from "@/types/domain";

const columns: DataTableColumn<IndicatorValue>[] = [
  {
    accessorKey: "placeId",
    header: "Commune (code INSEE)",
    meta: { sortable: true, sortField: "placeId" },
  },
  {
    accessorKey: "value",
    header: "Valeur",
    meta: { numeric: true, sortable: true, sortField: "value" },
  },
  {
    accessorKey: "sampleSize",
    header: "Échantillon",
    meta: { numeric: true },
  },
  { accessorKey: "status", header: "Statut qualité" },
];

const CAPTION = "Prix au m² 2024 par commune — données fictives";

/** Fixture officielle + une ligne avec un VRAI zéro (≠ donnée manquante). */
const rowsWithRealZero: IndicatorValue[] = [
  ...mockIndicatorValues,
  { ...mockIndicatorValues[0], placeId: "59000", value: 0, sampleSize: 25 },
];

function renderDataTable(
  props: Partial<Parameters<typeof DataTable<IndicatorValue>>[0]> = {},
) {
  return render(
    <DataTable
      columns={columns}
      rows={mockIndicatorValues}
      caption={CAPTION}
      {...props}
    />,
  );
}

describe("DataTable — état « données »", () => {
  it("annonce la légende du tableau comme nom accessible", () => {
    renderDataTable();
    expect(screen.getByRole("table", { name: CAPTION })).toBeInTheDocument();
  });

  it("expose les en-têtes avec scope col et le bon nombre de lignes", () => {
    renderDataTable();

    const headers = screen.getAllByRole("columnheader");
    expect(headers).toHaveLength(columns.length);
    for (const header of headers) {
      expect(header).toHaveAttribute("scope", "col");
    }

    // 1 ligne d'en-tête + 1 ligne par valeur d'indicateur.
    expect(screen.getAllByRole("row")).toHaveLength(
      1 + mockIndicatorValues.length,
    );
  });

  it("n'affiche jamais 0 pour une valeur null, mais affiche un vrai 0", () => {
    renderDataTable({ rows: rowsWithRealZero });

    // Statut « missing » (59253) : valeur null → « — ».
    expect(screen.getByRole("row", { name: /59253/ })).toHaveTextContent("—");

    // Ligne avec un vrai 0 : affichée « 0 », pas « — ».
    const zeroRow = screen.getByRole("row", { name: /59000/ });
    expect(zeroRow).toHaveTextContent("0");
    expect(zeroRow).not.toHaveTextContent("—");
  });

  it("aligne les cellules numériques à droite", () => {
    renderDataTable();

    const valueCell = screen.getByText("1980").closest("td");
    expect(valueCell).toHaveClass("text-right");

    const placeCell = screen.getByText("59230").closest("td");
    expect(placeCell).not.toHaveClass("text-right");
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

    fireEvent.click(screen.getByRole("button", { name: /Trier par Valeur/ }));
    expect(onSortChange).toHaveBeenCalledWith("value,asc");
  });

  it("bascule en « champ,desc » quand la colonne est déjà triée asc", () => {
    const onSortChange = vi.fn();
    renderDataTable({
      onSortChange,
      sort: { field: "value", direction: "asc" },
    });

    fireEvent.click(screen.getByRole("button", { name: /Trier par Valeur/ }));
    expect(onSortChange).toHaveBeenCalledWith("value,desc");
  });

  it("est utilisable au clavier : le contrôle de tri est un bouton natif", () => {
    renderDataTable({ onSortChange: vi.fn() });

    // Un <button> est focusable et activable à Entrée/Espace nativement.
    const sortButton = screen.getByRole("button", {
      name: /Trier par Valeur/,
    });
    expect(sortButton.tagName).toBe("BUTTON");
    sortButton.focus();
    expect(sortButton).toHaveFocus();
  });

  it("met aria-sort à jour sur la colonne triée", () => {
    const { rerender } = render(
      <DataTable
        columns={columns}
        rows={mockIndicatorValues}
        caption={CAPTION}
        onSortChange={vi.fn()}
        sort={{ field: "value", direction: "asc" }}
      />,
    );

    expect(
      screen.getByRole("columnheader", { name: /Valeur/ }),
    ).toHaveAttribute("aria-sort", "ascending");
    expect(
      screen.getByRole("columnheader", { name: /Commune/ }),
    ).toHaveAttribute("aria-sort", "none");

    rerender(
      <DataTable
        columns={columns}
        rows={mockIndicatorValues}
        caption={CAPTION}
        onSortChange={vi.fn()}
        sort={{ field: "value", direction: "desc" }}
      />,
    );
    expect(
      screen.getByRole("columnheader", { name: /Valeur/ }),
    ).toHaveAttribute("aria-sort", "descending");
  });

  it("ne rend pas les colonnes non triables interactives", () => {
    renderDataTable({ onSortChange: vi.fn() });

    const header = screen.getByRole("columnheader", {
      name: "Statut qualité",
    });
    expect(header).not.toHaveAttribute("aria-sort");
    expect(
      screen.queryByRole("button", { name: /Statut qualité/ }),
    ).not.toBeInTheDocument();
  });
});

describe("DataTable — lignes cliquables et sélection", () => {
  const getRowId = (row: IndicatorValue) => row.placeId;

  it("déclenche onRowClick au clic souris", () => {
    const onRowClick = vi.fn();
    renderDataTable({ onRowClick, getRowId });

    fireEvent.click(screen.getByRole("row", { name: /59230/ }));
    expect(onRowClick).toHaveBeenCalledWith(
      expect.objectContaining({ placeId: "59230" }),
    );
  });

  it("déclenche onRowClick au clavier (Entrée et Espace)", () => {
    const onRowClick = vi.fn();
    renderDataTable({ onRowClick, getRowId });

    const row = screen.getByRole("row", { name: /59253/ });
    fireEvent.keyDown(row, { key: "Enter" });
    fireEvent.keyDown(row, { key: " " });

    expect(onRowClick).toHaveBeenCalledTimes(2);
    expect(onRowClick).toHaveBeenCalledWith(
      expect.objectContaining({ placeId: "59253" }),
    );
  });

  it("marque la ligne sélectionnée avec aria-selected et un marqueur visuel", () => {
    renderDataTable({
      onRowClick: vi.fn(),
      getRowId,
      selectedId: "59252",
    });

    const selected = screen.getByRole("row", { name: /59252/ });
    expect(selected).toHaveAttribute("aria-selected", "true");
    expect(selected).toHaveAttribute("data-state", "selected");
    // Marqueur Vert Aubrelle : bordure intérieure, pas la couleur seule.
    expect(selected.className).toContain("shadow-[inset_4px_0_0_0");

    const other = screen.getByRole("row", { name: /59230/ });
    expect(other).toHaveAttribute("aria-selected", "false");
    expect(other).not.toHaveAttribute("data-state");
  });

  it("pose aria-selected même sans onRowClick quand selectedId est défini", () => {
    renderDataTable({ getRowId, selectedId: "59252" });

    expect(screen.getByRole("row", { name: /59252/ })).toHaveAttribute(
      "aria-selected",
      "true",
    );
    expect(screen.getByRole("row", { name: /59230/ })).toHaveAttribute(
      "aria-selected",
      "false",
    );
  });
});

describe("DataTable — colonnes personnalisées", () => {
  const columnsWithActions: DataTableColumn<IndicatorValue>[] = [
    { accessorKey: "placeId", header: "Commune (code INSEE)" },
    {
      id: "actions",
      header: "Actions",
      cell: () => <button type="button">Voir</button>,
    },
  ];

  it("rend une colonne d'affichage sans accesseur, jamais « — »", () => {
    renderDataTable({ columns: columnsWithActions });

    expect(
      screen.getAllByRole("button", { name: "Voir" }),
    ).toHaveLength(mockIndicatorValues.length);
    expect(screen.queryByText("—")).not.toBeInTheDocument();
  });

  it("laisse une cell personnalisée recevoir null et décider du rendu", () => {
    const columnsWithNullCell: DataTableColumn<IndicatorValue>[] = [
      { accessorKey: "placeId", header: "Commune (code INSEE)" },
      {
        accessorKey: "value",
        header: "Valeur",
        cell: (info) =>
          info.getValue() === null || info.getValue() === undefined
            ? "Non diffusé"
            : String(info.getValue()),
      },
    ];
    renderDataTable({ columns: columnsWithNullCell });

    // Statut « missing » (59253) : la cell reçoit null et affiche son libellé.
    const missingRow = screen.getByRole("row", { name: /59253/ });
    expect(missingRow).toHaveTextContent("Non diffusé");
    expect(missingRow).not.toHaveTextContent("—");
  });

  it("n'intercepte ni clavier ni clic venant d'un élément interactif en cellule", () => {
    const onRowClick = vi.fn();
    renderDataTable({
      columns: columnsWithActions,
      onRowClick,
      getRowId: (row) => row.placeId,
    });

    const actionButton = screen.getAllByRole("button", { name: "Voir" })[0];
    fireEvent.keyDown(actionButton, { key: "Enter" });
    fireEvent.keyDown(actionButton, { key: " " });
    fireEvent.click(actionButton);
    expect(onRowClick).not.toHaveBeenCalled();

    // Le clic sur une cellule ordinaire déclenche toujours la ligne.
    fireEvent.click(screen.getByText("59230"));
    expect(onRowClick).toHaveBeenCalledTimes(1);
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
    expect(nextSortState({ field: "name", direction: "asc" }, "name")).toEqual(
      { field: "name", direction: "desc" },
    );
    expect(
      nextSortState({ field: "name", direction: "desc" }, "population"),
    ).toEqual({ field: "population", direction: "asc" });
  });
});
