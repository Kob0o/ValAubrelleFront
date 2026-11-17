"use client";

import { useId } from "react";
import { cn } from "cn";

import { FieldErrorMessage } from "@/components/forms/field-wrapper";
import { YearPicker } from "@/components/forms/year-picker";
import {
  periodErrorMessage,
  validatePeriod,
  type PeriodValidation,
  type YearPeriodInput,
} from "@/lib/period";
import type { ExplorerYear } from "@/types/domain";

export type PeriodPickerProps = {
  years: readonly ExplorerYear[];
  value: YearPeriodInput;
  /** Reçoit la période et sa validation : le parent n'envoie à l'API qu'une période `ok`. */
  onChange: (value: YearPeriodInput, validation: PeriodValidation) => void;
  /** Début = fin autorisé (défaut : `true`). */
  allowSingleYear?: boolean;
  legend?: string;
  /** Erreur du parent pour tout le groupe (ex. : « Choisissez une période » à l'envoi). */
  error?: string;
  disabled?: boolean;
  id?: string;
  className?: string;
};

/**
 * Deux YearPicker « Année de début » / « Année de fin » dans un `<fieldset>`.
 * Pas d'inversion silencieuse : une période inversée est signalée et reliée
 * au groupe. Pas de curseur à double poignée : deux listes, utilisables au
 * clavier et au toucher, l'une sous l'autre sur mobile.
 */
export function PeriodPicker({
  years,
  value,
  onChange,
  allowSingleYear = true,
  legend = "Période",
  error,
  disabled = false,
  id,
  className,
}: PeriodPickerProps) {
  const generatedId = useId();
  const groupId = id ?? `period-${generatedId}`;
  const legendId = `${groupId}-legend`;
  const groupErrorId = `${groupId}-error`;

  const validation = validatePeriod(value, { years, allowSingleYear });

  function change(next: YearPeriodInput) {
    onChange(next, validatePeriod(next, { years, allowSingleYear }));
  }

  // Les années indisponibles sont signalées par chaque YearPicker ; une borne
  // manquante l'est sur son champ dès que l'autre est choisie ; l'ordre et
  // l'année unique concernent le groupe.
  const missing =
    !validation.ok && validation.code === "MISSING_BOUND" && validation.bound !== "both"
      ? validation.bound
      : undefined;
  const groupError =
    error ??
    (!validation.ok && (validation.code === "INVERTED" || validation.code === "SINGLE_YEAR")
      ? periodErrorMessage(validation, value)
      : undefined);
  const missingMessage =
    !validation.ok && missing ? periodErrorMessage(validation, value) : undefined;

  return (
    <fieldset
      id={groupId}
      aria-labelledby={legendId}
      aria-describedby={groupError ? groupErrorId : undefined}
      disabled={disabled}
      className={cn("flex min-w-0 flex-col gap-4", className)}
    >
      {/* `float-left` : la légende se comporte comme une ligne normale (Safari). */}
      <legend
        id={legendId}
        className="float-left w-full text-base leading-snug font-semibold text-foreground"
      >
        {legend}
      </legend>

      <div className="grid gap-4 sm:grid-cols-2">
        <YearPicker
          id={`${groupId}-start`}
          label="Année de début"
          years={years}
          value={value.start}
          onChange={(start) => change({ ...value, start })}
          error={missing === "start" ? missingMessage : undefined}
          disabled={disabled}
        />
        <YearPicker
          id={`${groupId}-end`}
          label="Année de fin"
          years={years}
          value={value.end}
          onChange={(end) => change({ ...value, end })}
          error={missing === "end" ? missingMessage : undefined}
          disabled={disabled}
        />
      </div>

      {groupError ? (
        <FieldErrorMessage id={groupErrorId}>{groupError}</FieldErrorMessage>
      ) : null}
    </fieldset>
  );
}
