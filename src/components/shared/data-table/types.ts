/**
 * Types du DataTable partagé (lot G0 → G3 Transverses).
 *
 * Le tri est contrôlé par le parent (tri serveur par défaut) : le composant
 * ne trie jamais les lignes lui-même, il produit la chaîne `sort` au format
 * du contrat d'API (`champ,asc` / `champ,desc`, inventaire B1).
 */

/** Métadonnées de colonne propres au DataTable Val d'Aubrelle. */
export interface DataTableColumnMeta {
  /** Colonne numérique : contenu aligné à droite, chiffres tabulaires. */
  numeric?: boolean;
  /** En-tête triable : le clic déclenche `onSortChange` (tri serveur). */
  sortable?: boolean;
  /** Champ du contrat d'API utilisé dans la chaîne sort (défaut : id de colonne). */
  sortField?: string;
}

export type SortDirection = "asc" | "desc";

export interface SortState {
  field: string;
  direction: SortDirection;
}

/**
 * Transforme une chaîne du contrat d'API en état de tri.
 * « name,asc » → `{ field: "name", direction: "asc" }`.
 * Renvoie `null` si la chaîne est absente ou invalide.
 */
export function parseSortString(
  value: string | null | undefined,
): SortState | null {
  if (!value) {
    return null;
  }
  const [field, direction] = value.split(",");
  if (!field || (direction !== "asc" && direction !== "desc")) {
    return null;
  }
  return { field, direction };
}

/**
 * Transforme un état de tri en chaîne du contrat d'API.
 * `{ field: "name", direction: "asc" }` → « name,asc ».
 */
export function toSortString(sort: SortState): string {
  return `${sort.field},${sort.direction}`;
}

/**
 * Calcule le prochain état de tri pour un en-tête donné :
 * nouveau champ → `asc` ; même champ → bascule `asc` ↔ `desc`.
 */
export function nextSortState(
  current: SortState | null | undefined,
  field: string,
): SortState {
  if (current?.field === field) {
    return { field, direction: current.direction === "asc" ? "desc" : "asc" };
  }
  return { field, direction: "asc" };
}
