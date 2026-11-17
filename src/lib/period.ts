import type { ExplorerYear } from "@/types/domain";

/** Période choisie dans PeriodPicker ; une borne vide vaut `undefined`. */
export type YearPeriodInput = {
  start: number | undefined;
  end: number | undefined;
};

/** Période complète, bornes incluses (début ≤ fin). */
export type YearPeriod = {
  start: number;
  end: number;
};

/**
 * - `MISSING_BOUND` : début et/ou fin non choisis.
 * - `NO_DATA` : une borne n'a pas de donnée ou n'existe pas dans `years`.
 * - `INVERTED` : début postérieur à la fin.
 * - `SINGLE_YEAR` : début = fin alors que `allowSingleYear` est faux
 *   (code ajouté : le ticket n'en prévoyait pas pour ce cas).
 */
export type PeriodErrorCode = "MISSING_BOUND" | "NO_DATA" | "INVERTED" | "SINGLE_YEAR";

/** Borne(s) concernée(s) par l'erreur. */
export type PeriodBound = "start" | "end" | "both";

export type PeriodValidation =
  | { ok: true; period: YearPeriod }
  | { ok: false; code: PeriodErrorCode; bound: PeriodBound };

export type ValidatePeriodOptions = {
  /** Années renvoyées par GET /explorer ; sans elles, `NO_DATA` n'est pas vérifié. */
  years?: readonly ExplorerYear[];
  /** Début = fin autorisé (défaut : `true`). */
  allowSingleYear?: boolean;
};

/** L'année existe dans `years` et a des données. */
export function isYearAvailable(years: readonly ExplorerYear[], year: number): boolean {
  return years.some((item) => item.year === year && item.hasData);
}

/**
 * Valide une période sans jamais la corriger : une période inversée est
 * signalée, pas permutée. Ordre des contrôles : bornes manquantes, années
 * indisponibles, ordre, année unique.
 */
export function validatePeriod(
  { start, end }: YearPeriodInput,
  { years, allowSingleYear = true }: ValidatePeriodOptions = {},
): PeriodValidation {
  if (start === undefined || end === undefined) {
    return {
      ok: false,
      code: "MISSING_BOUND",
      bound: start === undefined && end === undefined ? "both" : start === undefined ? "start" : "end",
    };
  }

  if (years) {
    const startOk = isYearAvailable(years, start);
    const endOk = isYearAvailable(years, end);
    if (!startOk || !endOk) {
      return {
        ok: false,
        code: "NO_DATA",
        bound: !startOk && !endOk ? "both" : !startOk ? "start" : "end",
      };
    }
  }

  if (start > end) return { ok: false, code: "INVERTED", bound: "both" };
  if (start === end && !allowSingleYear) {
    return { ok: false, code: "SINGLE_YEAR", bound: "both" };
  }

  return { ok: true, period: { start, end } };
}

/** Paramètres `startYear` / `endYear` de GET /explorer. */
export function toYearRangeQuery({ start, end }: YearPeriod) {
  return { startYear: start, endYear: end };
}

/**
 * Paramètres `start` / `end` (dates YYYY-MM-DD) de
 * GET /indicators/{indicatorId}/analysis et du schéma `Period`.
 *
 * TODO contrat : convention « 1er janvier – 31 décembre » à confirmer avec le
 * back, ainsi que le sens de `vintage` (non renseigné ici).
 */
export function toDateRangeQuery({ start, end }: YearPeriod) {
  return { start: `${start}-01-01`, end: `${end}-12-31` };
}

/** Messages affichés par PeriodPicker, en français et exploitables. */
export function periodErrorMessage(
  validation: Extract<PeriodValidation, { ok: false }>,
  input: YearPeriodInput,
): string {
  switch (validation.code) {
    case "MISSING_BOUND":
      return validation.bound === "both"
        ? "Choisissez l’année de début et l’année de fin."
        : validation.bound === "start"
          ? "Choisissez l’année de début."
          : "Choisissez l’année de fin.";
    case "NO_DATA":
      return validation.bound === "both"
        ? "Aucune donnée n’est disponible pour ces années. Choisissez d’autres années."
        : `Aucune donnée n’est disponible pour ${validation.bound === "start" ? input.start : input.end}. Choisissez une autre année.`;
    case "INVERTED":
      return "L’année de début doit être antérieure ou égale à l’année de fin.";
    case "SINGLE_YEAR":
      return "Choisissez deux années différentes pour comparer une évolution.";
  }
}
