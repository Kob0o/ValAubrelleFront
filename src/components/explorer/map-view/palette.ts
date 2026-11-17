import type { ValueClass } from "./types";

export const DATA_PALETTE = [
  "var(--data-seq-1)",
  "var(--data-seq-2)",
  "var(--data-seq-3)",
  "var(--data-seq-4)",
  "var(--data-seq-5)",
] as const;

export const NO_DATA_LABEL = "Pas de donnée";
export const SELECTION_COLOR = "var(--color-primary-strong)";

export function classColor(valueClass?: ValueClass) {
  if (!valueClass || valueClass.isNoData || !valueClass.paletteIndex) return null;
  return DATA_PALETTE[valueClass.paletteIndex - 1] ?? null;
}
