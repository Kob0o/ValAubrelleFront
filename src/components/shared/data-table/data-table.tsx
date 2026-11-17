"use client";

import { tableFeatures, useTable, type ColumnDef } from "@tanstack/react-table";
import { ArrowDown, ArrowUp, ArrowUpDown } from "lucide-react";
import { cn } from "cn";

import { EmptyState } from "@/components/shared/empty-state";
import { Skeleton } from "@/components/shared/skeleton";
import {
  nextSortState,
  toSortString,
  type DataTableColumnMeta,
  type SortState,
} from "@/components/shared/data-table/types";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

/**
 * Jeu de fonctionnalités TanStack Table v9 du DataTable.
 * Le tri est serveur (contrôlé par le parent) : aucune feature de tri
 * local n'est enregistrée. Le slot `columnMeta` type les métadonnées
 * de colonne propres au projet (numeric, sortable, sortField).
 */
const features = tableFeatures({
  columnMeta: {} as DataTableColumnMeta,
});

export type DataTableFeatures = typeof features;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyRow = Record<string, any>;

export type DataTableColumn<TData extends AnyRow> = ColumnDef<
  DataTableFeatures,
  TData,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  any
>;

export interface DataTableProps<TData extends AnyRow> {
  /** Définitions de colonnes (pattern shadcn + @tanstack/react-table). */
  columns: DataTableColumn<TData>[];
  /** Lignes déjà triées/filtrées côté serveur. */
  rows: TData[];
  /** Légende du tableau, OBLIGATOIRE (a11y : nom accessible du tableau). */
  caption: string;
  /** Tri courant, contrôlé par le parent. */
  sort?: SortState | null;
  /** Appelé avec la chaîne du contrat d'API : « champ,asc » / « champ,desc ». */
  onSortChange?: (sort: string) => void;
  /** État de chargement : affiche des Skeleton. */
  loading?: boolean;
  /** Force l'état vide (par défaut : `rows.length === 0`). */
  empty?: boolean;
  /** Message d'erreur à afficher (role="alert"). */
  error?: string | null;
  /** Clic sur une ligne — accessible au clavier (Entrée / Espace). */
  onRowClick?: (row: TData) => void;
  /** Identifiant de la ligne sélectionnée (marqueur Vert Aubrelle + aria-selected). */
  selectedId?: string | number | null;
  /** Extraction de l'identifiant d'une ligne (défaut : `row.id`). */
  getRowId?: (row: TData) => string | number | undefined;
}

/**
 * Tableau de données partagé (P4, P9, P10, P12, P14, P18).
 * Quatre états : chargement (Skeleton), données, vide (EmptyState), erreur.
 * Charte : en-têtes Inter SemiBold Anthracite, survol Brume, ligne
 * sélectionnée marquée au Vert Aubrelle — jamais par la couleur seule.
 */
export function DataTable<TData extends AnyRow>({
  columns,
  rows,
  caption,
  sort = null,
  onSortChange,
  loading = false,
  empty,
  error = null,
  onRowClick,
  selectedId = null,
  getRowId,
}: DataTableProps<TData>) {
  const table = useTable({ features, columns, data: rows });

  if (loading) {
    return (
      <div role="status" aria-busy="true" className="space-y-2">
        <span className="sr-only">Chargement des données…</span>
        <Skeleton className="h-11 w-full" />
        {Array.from({ length: 4 }, (_, index) => (
          <Skeleton key={index} className="h-12 w-full" />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div
        role="alert"
        className="rounded-lg border border-destructive/40 bg-destructive/10 px-4 py-6 text-center text-sm text-destructive"
      >
        {error}
      </div>
    );
  }

  if (empty ?? rows.length === 0) {
    return <EmptyState />;
  }

  const resolveRowId = (row: TData): string | number | undefined =>
    getRowId ? getRowId(row) : (row as { id?: string | number }).id;

  const clickable = Boolean(onRowClick);

  return (
    <Table>
      <TableCaption className="caption-top mb-2 text-left text-sm font-medium text-foreground">
        {caption}
      </TableCaption>
      <TableHeader>
        {table.getHeaderGroups().map((headerGroup) => (
          <TableRow key={headerGroup.id} className="hover:bg-transparent">
            {headerGroup.headers.map((header) => {
              if (header.isPlaceholder) {
                return <TableHead key={header.id} />;
              }
              const meta = header.column.columnDef.meta;
              const numeric = Boolean(meta?.numeric);
              const sortField = meta?.sortField ?? header.column.id;
              const sortable = Boolean(meta?.sortable && onSortChange);
              const isSorted = sort?.field === sortField;
              const ariaSort = !sortable
                ? undefined
                : isSorted
                  ? sort.direction === "asc"
                    ? "ascending"
                    : "descending"
                  : "none";
              const headerLabel =
                typeof header.column.columnDef.header === "string"
                  ? header.column.columnDef.header
                  : sortField;

              return (
                <TableHead
                  key={header.id}
                  scope="col"
                  aria-sort={ariaSort}
                  className={cn(
                    "font-semibold text-foreground",
                    numeric && "text-right",
                  )}
                >
                  {sortable ? (
                    <button
                      type="button"
                      onClick={() =>
                        onSortChange?.(
                          toSortString(nextSortState(sort, sortField)),
                        )
                      }
                      className={cn(
                        "inline-flex min-h-11 min-w-11 items-center gap-1.5 rounded-md px-2 font-semibold",
                        "hover:text-primary focus-visible:outline-2 focus-visible:outline-primary",
                        numeric && "flex-row-reverse",
                      )}
                      aria-label={`Trier par ${headerLabel}${
                        isSorted
                          ? sort.direction === "asc"
                            ? ", tri croissant actif"
                            : ", tri décroissant actif"
                          : ""
                      }`}
                    >
                      <table.FlexRender header={header} />
                      {isSorted ? (
                        sort.direction === "asc" ? (
                          <ArrowUp aria-hidden="true" className="size-4" />
                        ) : (
                          <ArrowDown aria-hidden="true" className="size-4" />
                        )
                      ) : (
                        <ArrowUpDown
                          aria-hidden="true"
                          className="size-4 text-muted-foreground"
                        />
                      )}
                    </button>
                  ) : (
                    <table.FlexRender header={header} />
                  )}
                </TableHead>
              );
            })}
          </TableRow>
        ))}
      </TableHeader>
      <TableBody>
        {table.getRowModel().rows.map((row) => {
          const original = row.original;
          const rowId = resolveRowId(original);
          const isSelected = selectedId != null && rowId === selectedId;

          return (
            <TableRow
              key={row.id}
              data-state={isSelected ? "selected" : undefined}
              aria-selected={clickable ? isSelected : undefined}
              tabIndex={clickable ? 0 : undefined}
              onClick={clickable ? () => onRowClick?.(original) : undefined}
              onKeyDown={
                clickable
                  ? (event) => {
                      if (event.key === "Enter" || event.key === " ") {
                        event.preventDefault();
                        onRowClick?.(original);
                      }
                    }
                  : undefined
              }
              className={cn(
                "hover:bg-muted",
                clickable &&
                  "cursor-pointer focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-primary",
                isSelected &&
                  "bg-muted shadow-[inset_4px_0_0_0_var(--color-primary)]",
              )}
            >
              {row.getAllCells().map((cell) => {
                const value = cell.getValue();
                const numeric = Boolean(cell.column.columnDef.meta?.numeric);
                const isMissing =
                  value === null || value === undefined || value === "";

                return (
                  <TableCell
                    key={cell.id}
                    className={cn(
                      "h-11",
                      numeric && "text-right tabular-nums",
                    )}
                  >
                    {isMissing ? (
                      // Une valeur null n'est jamais affichée 0.
                      <span className="text-muted-foreground">—</span>
                    ) : (
                      <table.FlexRender cell={cell} />
                    )}
                  </TableCell>
                );
              })}
            </TableRow>
          );
        })}
      </TableBody>
    </Table>
  );
}
