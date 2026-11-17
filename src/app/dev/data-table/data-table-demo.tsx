"use client";

import { useMemo, useState } from "react";

import {
  DataTable,
  parseSortString,
  type DataTableColumn,
  type SortState,
} from "@/components/shared/data-table";
import { QualityValue } from "@/components/shared/quality-value";
import { compareIndicatorValues } from "@/lib/compare-indicator-values";
import { mockMunicipalities } from "@/mocks/municipalities";
import { mockIndicatorValues } from "@/mocks/quality-status";
import type { IndicatorValue } from "@/types/domain";

const nameByCode = new Map<string, string>(
  mockMunicipalities.map((municipality) => [municipality.code, municipality.name]),
);

function communeLabel(placeId: string): string {
  return nameByCode.get(placeId) ?? placeId;
}

const columns: DataTableColumn<IndicatorValue>[] = [
  {
    id: "commune",
    accessorFn: (row) => communeLabel(row.placeId),
    header: "Commune",
    meta: { sortable: true, sortField: "commune" },
  },
  {
    accessorKey: "value",
    header: "Prix au m²",
    meta: { numeric: true, sortable: true, sortField: "value" },
    cell: (info) => (
      <QualityValue value={info.row.original} unit="€/m²" />
    ),
  },
  {
    accessorKey: "sampleSize",
    header: "Échantillon",
    meta: { numeric: true },
  },
  { accessorKey: "status", header: "Statut qualité" },
];

/**
 * Démo du DataTable (lot G0) sur les fixtures officielles de src/mocks/.
 * Le tri est rejoué côté client UNIQUEMENT pour simuler la réponse du
 * serveur : en production, le parent envoie la chaîne sort à l'API.
 */
export function DataTableDemo() {
  const [sort, setSort] = useState<SortState | null>({
    field: "commune",
    direction: "asc",
  });
  const [selectedId, setSelectedId] = useState<string | number | null>(null);
  const [lastClick, setLastClick] = useState<string | null>(null);

  const sortedRows = useMemo(() => {
    if (!sort) {
      return mockIndicatorValues;
    }
    if (sort.field === "value") {
      return [...mockIndicatorValues].sort((a, b) =>
        compareIndicatorValues(a, b, sort.direction),
      );
    }
    const sortValue = (row: IndicatorValue): string | number | null =>
      sort.field === "commune"
        ? communeLabel(row.placeId)
        : (row[sort.field as keyof IndicatorValue] as string | number | null);

    return [...mockIndicatorValues].sort((a, b) => {
      const left = sortValue(a);
      const right = sortValue(b);
      if (left === null || left === undefined) return 1;
      if (right === null || right === undefined) return -1;
      const order =
        typeof left === "string" && typeof right === "string"
          ? left.localeCompare(right, "fr")
          : left < right
            ? -1
            : left > right
              ? 1
              : 0;
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
          Prix au m² 2024 par commune (fixtures fictives, une par statut
          qualité). Cliquez sur un en-tête triable : le parent reçoit la
          chaîne du contrat et renvoie les lignes triées. Cliquez sur une
          ligne pour la sélectionner — Entrée et Espace fonctionnent aussi.
        </p>
        <DataTable
          columns={columns}
          rows={sortedRows}
          caption="Prix au m² 2024 par commune, un exemple par statut qualité — source fictive DVF, données de démonstration"
          sort={sort}
          onSortChange={(value) => setSort(parseSortString(value))}
          onRowClick={(row) => {
            setSelectedId(row.placeId);
            setLastClick(communeLabel(row.placeId));
          }}
          selectedId={selectedId}
          getRowId={(row) => row.placeId}
        />
        <p
          className="text-sm text-[var(--color-text-muted)]"
          aria-live="polite"
        >
          Chaîne sort émise :{" "}
          <code className="font-semibold">
            {sort ? `${sort.field},${sort.direction}` : "aucune"}
          </code>
          {lastClick ? ` · Dernière ligne cliquée : ${lastClick}` : ""}
        </p>
      </section>

      <section
        aria-labelledby="demo-chargement"
        className="flex flex-col gap-3"
      >
        <h2
          id="demo-chargement"
          className="text-2xl font-semibold text-[var(--color-primary-strong)]"
        >
          Chargement
        </h2>
        <DataTable
          columns={columns}
          rows={[]}
          caption="Prix au m² 2024 par commune — chargement en cours"
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
          caption="Prix au m² 2024 par commune — aucun résultat"
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
          caption="Prix au m² 2024 par commune — erreur de chargement"
          error="Impossible de charger les indicateurs. Vérifiez votre connexion puis réessayez."
        />
      </section>
    </div>
  );
}
