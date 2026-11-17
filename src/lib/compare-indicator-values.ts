import type { IndicatorValue } from "@/types/domain";

type ComparableValue = Pick<IndicatorValue, "value" | "status">;

function isAvailable(
  entry: ComparableValue,
): entry is ComparableValue & { value: number } {
  return entry.status === "available" && entry.value != null;
}

/**
 * Tri des valeurs d'indicateur : les valeurs non disponibles sont toujours
 * rangées en fin de liste, quel que soit le sens du tri.
 */
export function compareIndicatorValues(
  left: ComparableValue,
  right: ComparableValue,
  direction: "asc" | "desc" = "asc",
) {
  const leftAvailable = isAvailable(left);
  const rightAvailable = isAvailable(right);
  if (!leftAvailable || !rightAvailable) {
    return Number(rightAvailable) - Number(leftAvailable);
  }
  const order = left.value - right.value;
  return direction === "asc" ? order : -order;
}
