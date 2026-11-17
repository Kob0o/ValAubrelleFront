/**
 * Formatage `fr-FR` des valeurs d'indicateur : espace insécable fine entre
 * les milliers, virgule décimale, espace insécable avant l'unité.
 */
export type ValueFormat = "number" | "percent" | "currency";

export type FormatValueOptions = {
  format?: ValueFormat;
  /** Nombre de décimales affichées (défaut : 0, ou 1 pour un pourcentage). */
  precision?: number;
  /** Unité ajoutée après la valeur, ex. « €/m² », « logements ». */
  unit?: string;
};

const NBSP = " ";

/**
 * `percent` attend une valeur déjà exprimée en pourcentage (12.5 → « 12,5 % »),
 * comme les indicateurs de l'API, et non une fraction.
 */
export function formatValue(
  value: number,
  { format = "number", precision, unit }: FormatValueOptions = {},
) {
  const digits = precision ?? (format === "percent" ? 1 : 0);
  const formatted = new Intl.NumberFormat("fr-FR", {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
    ...(format === "currency" ? { style: "currency", currency: "EUR" } : {}),
  }).format(value);

  const withPercent = format === "percent" ? `${formatted}${NBSP}%` : formatted;
  return unit ? `${withPercent}${NBSP}${unit}` : withPercent;
}
