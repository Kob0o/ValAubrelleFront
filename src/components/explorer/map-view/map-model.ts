import { classColor, NO_DATA_LABEL } from "./palette";
import type { IndicatorFamily, IndicatorValue, Municipality, ValueClass } from "./types";

export const MUNICIPALITY_CODE_PATTERN = /^(?:\d{5}|2[AB]\d{3})$/;

export function inPerimeter(municipalities: Municipality[]) {
  return municipalities.filter((item) => item.isInPerimeter && MUNICIPALITY_CODE_PATTERN.test(item.code));
}

export function drawableMunicipalities(municipalities: Municipality[]) {
  return inPerimeter(municipalities).filter((item) => item.geometry !== null);
}

export function municipalityValue(code: string, values: IndicatorValue[], layer: IndicatorFamily) {
  return values.find((item) => item.municipalityCode === code && item.layer === layer);
}

export function valuePresentation(value: IndicatorValue | undefined, classes: ValueClass[]) {
  const valueClass = classes.find((item) => item.id === value?.classId);
  const color = classColor(valueClass);
  if (value?.value == null || !Number.isFinite(value.value) || !color) {
    return { color: null, label: NO_DATA_LABEL, isNoData: true };
  }
  return { color, label: valueClass!.label, isNoData: false };
}

export function formatValue(value: IndicatorValue | undefined, classes: ValueClass[]) {
  if (valuePresentation(value, classes).isNoData) return NO_DATA_LABEL;
  return `${new Intl.NumberFormat("fr-FR", { maximumFractionDigits: 1 }).format(value!.value!)} ${value!.layer === "price" ? "€/m²" : "%"}`;
}
