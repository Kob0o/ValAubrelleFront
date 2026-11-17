"use client";

import { useMemo, useState } from "react";

import {
  DataTable,
  parseSortString,
  type DataTableColumn,
  type SortState,
} from "@/components/shared/data-table";
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
    cell: (info) => Number(info.getValue()).toLocaleString("fr-FR"),
  },
  {
    accessorKey: "qualityScore",
    header: "Score qualité",
    meta: { numeric: true, sortable: true, sortField: "qualityScore" },
  },
  {
    accessorKey: "openRequests",
    header: "Demandes",
    meta: { numeric: true },
  },
];

/**
 * Démo du DataTable (lot G0) avec les fixtures de src/mocks/.
 * Le tri est rejoué côté client UNIQUEMENT pour simuler la réponse du
 * serveur : en production, le parent renvoie la chaîne sort à l'API.
 */
export function DataTableDemo() {
  const [sort, setSort] = useState<SortState | null>({
    field: "name",
    direction: "asc",
  });
  const [selectedId, setSelectedId] = useState<string | number | null>(null);
  const [lastClick, setLastClick] = useState<string | null>(null);

  const sortedRows = useMemo(() => {
    if (!sort) {
      return municipalities;
    }
    const key = sort.field as keyof MunicipalityFixture;
    return [...municipalities].sort((a, b) => {
      const left = a[key];
      const right = b[key];
      if (left === null || left === undefined) return 1;
      if (right === null || right === undefined) return -1;
      const order = left < right ? -1 : left > right ? 1 : 0;
      return sort.direction === "asc" ? order : -order;
    });
  }, [sort]);

  return (
    <div className="flex flex-col gap-10">
      <section aria-labelledby="demo-donnees" className="flex flex-col gap-3">
        <h2
          id="demo-donnees"
          className="text-2xl font-semibold text-[var(--color-primary-strong)]"
        >
          Données — tri et sélection interactifs
        </h2>
        <p className="text-base text-[var(--color-text)]">
          Cliquez sur un en-tête triable : le parent reçoit la chaîne du
          contrat et renvoie les lignes triées (simulation). Cliquez sur une
          ligne pour la sélectionner — Entrée et Espace fonctionnent aussi.
        </p>
        <DataTable
          columns={columns}
          rows={sortedRows}
          caption="Communes du Val d'Aubrelle — population, score qualité et demandes en cours"
          sort={sort}
          onSortChange={(value) => setSort(parseSortString(value))}
          onRowClick={(row) => {
            setSelectedId(row.id);
            setLastClick(row.name);
          }}
          selectedId={selectedId}
        />
        <p className="text-sm text-[var(--color-text-muted)]" aria-live="polite">
          Chaîne sort émise :{" "}
          <code className="font-semibold">
            {sort ? `${sort.field},${sort.direction}` : "aucune"}
          </code>
          {lastClick ? ` · Dernière ligne cliquée : ${lastClick}` : ""}
        </p>
      </section>

      <section aria-labelledby="demo-chargement" className="flex flex-col gap-3">
        <h2
          id="demo-chargement"
          className="text-2xl font-semibold text-[var(--color-primary-strong)]"
        >
          Chargement
        </h2>
        <DataTable
          columns={columns}
          rows={[]}
          caption="Communes du Val d'Aubrelle — chargement en cours"
          loading
        />
      </section>

      <section aria-labelledby="demo-vide" className="flex flex-col gap-3">
        <h2
          id="demo-vide"
          className="text-2xl font-semibold text-[var(--color-primary-strong)]"
        >
          Vide
        </h2>
        <DataTable
          columns={columns}
          rows={[]}
          caption="Communes du Val d'Aubrelle — aucun résultat"
        />
      </section>

      <section aria-labelledby="demo-erreur" className="flex flex-col gap-3">
        <h2
          id="demo-erreur"
          className="text-2xl font-semibold text-[var(--color-primary-strong)]"
        >
          Erreur
        </h2>
        <DataTable
          columns={columns}
          rows={[]}
          caption="Communes du Val d'Aubrelle — erreur de chargement"
          error="Impossible de charger les communes. Vérifiez votre connexion puis réessayez."
        />
      </section>
    </div>
  );
}
