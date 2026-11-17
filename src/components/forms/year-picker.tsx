"use client";

import { useMemo } from "react";

import { SelectField, type SelectOption } from "@/components/forms/select-field";
import type { ExplorerYear } from "@/types/domain";

export type YearPickerProps = {
  label: string;
  /** Années renvoyées par GET /explorer (`years`), dans n'importe quel ordre. */
  years: readonly ExplorerYear[];
  value: number | undefined;
  onChange: (year: number) => void;
  /** Erreur fournie par le parent ; prioritaire sur l'erreur d'année indisponible. */
  error?: string;
  /** Consigne, dans l'infobulle de l'icône d'information. */
  hint?: string;
  required?: boolean;
  disabled?: boolean;
  placeholder?: string;
  name?: string;
  id?: string;
  className?: string;
};

/** Libellé d'une année : « (sans donnée) » en texte, jamais la couleur seule. */
export function yearOptionLabel({ year, hasData }: ExplorerYear): string {
  return hasData ? String(year) : `${year} (sans donnée)`;
}

/**
 * Message quand `value` ne peut pas être choisie : absente de la liste
 * (URL ancienne…) ou sans donnée. `undefined` si la valeur est valable.
 */
export function unavailableYearMessage(
  years: readonly ExplorerYear[],
  value: number | undefined,
): string | undefined {
  if (value === undefined) return undefined;
  const item = years.find((candidate) => candidate.year === value);
  if (!item) return `L’année ${value} n’est pas disponible. Choisissez une autre année.`;
  if (!item.hasData) {
    return `Aucune donnée n’est disponible pour ${value}. Choisissez une autre année.`;
  }
  return undefined;
}

/**
 * Choix d'une année, dérivé de SelectField (G0.F) : années de la plus récente
 * à la plus ancienne ; une année sans donnée est affichée, désactivée (ni
 * clavier ni souris) et lue « (sans donnée) » par le lecteur d'écran.
 */
export function YearPicker({
  label,
  years,
  value,
  onChange,
  error,
  hint,
  required = false,
  disabled = false,
  placeholder = "Choisir une année",
  name,
  id,
  className,
}: YearPickerProps) {
  const options = useMemo<SelectOption[]>(
    () =>
      [...years]
        .sort((a, b) => b.year - a.year)
        .map((item) => ({
          value: String(item.year),
          label: yearOptionLabel(item),
          disabled: !item.hasData,
        })),
    [years],
  );

  const inList = value !== undefined && years.some((item) => item.year === value);

  return (
    <SelectField
      id={id}
      name={name}
      label={label}
      options={options}
      // Valeur absente de la liste : champ vide + message, jamais une année inventée.
      value={inList ? String(value) : undefined}
      onChange={(next) => onChange(Number(next))}
      placeholder={placeholder}
      error={error ?? unavailableYearMessage(years, value)}
      hint={hint}
      required={required}
      disabled={disabled}
      emptyMessage="Aucune année disponible"
      className={className}
    />
  );
}
