"use client";

import { useId, type ReactNode } from "react";
import { cn } from "cn";

import {
  FieldErrorMessage,
  FieldHint,
  describedByIds,
} from "@/components/forms/field-wrapper";
import { Badge } from "@/components/ui/badge";
import {
  RadioGroup as RadioGroupRoot,
  RadioGroupItem,
} from "@/components/ui/radio-group";

export type RadioGroupProps = {
  /** Question posée, affichée dans la `<legend>` visible du `<fieldset>`. */
  legend: string;
  name?: string;
  value: string | undefined;
  onChange: (value: string) => void;
  /** Erreur portée par le groupe, par ex. `getFieldError(apiError, name)`. */
  error?: string;
  /** Consigne affichée dans l'infobulle d'aide à côté de la légende. */
  hint?: string;
  required?: boolean;
  /** Désactive tout le groupe. */
  disabled?: boolean;
  /** `vertical` (par défaut) ou `horizontal` pour 2–3 options courtes. */
  orientation?: "vertical" | "horizontal";
  id?: string;
  className?: string;
  children: ReactNode;
};

/**
 * Groupe de boutons radio : `<fieldset>` + `<legend>` visible, erreur portée
 * par le groupe (`aria-invalid`, `aria-describedby`). Clavier (Radix) :
 * flèches pour changer d'option, Tab pour sortir du groupe.
 */
export function RadioGroup({
  legend,
  name,
  value,
  onChange,
  error,
  hint,
  required = false,
  disabled = false,
  orientation = "vertical",
  id,
  className,
  children,
}: RadioGroupProps) {
  const generatedId = useId();
  const groupId = id ?? `radio-group-${generatedId}`;
  const legendId = `${groupId}-legend`;
  const hintId = `${groupId}-hint`;
  const errorId = `${groupId}-error`;

  return (
    <fieldset
      className={cn("min-w-0", className)}
      data-slot="field"
      disabled={disabled}
    >
      {/*
        La <legend> doit être le premier enfant du <fieldset> (nom du groupe) et
        ne contenir que la question : l'aide et le badge sont à côté, pas dedans.
        Le flottant les place sur la même ligne, comme pour TextField.
      */}
      <legend
        id={legendId}
        className="float-left mr-2 text-base leading-snug font-semibold text-foreground"
      >
        {legend}
      </legend>
      <div className="flex min-h-6 flex-wrap items-center justify-between gap-2">
        {hint ? <FieldHint label={legend} hint={hint} /> : <span />}
        {required ? (
          <Badge variant="secondary" aria-hidden="true">
            Obligatoire
          </Badge>
        ) : null}
      </div>

      {hint ? (
        <p id={hintId} className="sr-only">
          {hint}
        </p>
      ) : null}

      <RadioGroupRoot
        id={groupId}
        name={name}
        value={value ?? ""}
        onValueChange={onChange}
        required={required}
        disabled={disabled}
        orientation={orientation}
        aria-labelledby={legendId}
        aria-describedby={describedByIds(hint && hintId, error && errorId)}
        aria-invalid={error ? true : undefined}
        aria-required={required ? true : undefined}
        className={cn(
          "clear-both pt-2",
          orientation === "horizontal" && "flex flex-wrap gap-x-6",
        )}
      >
        {children}
      </RadioGroupRoot>

      {error ? (
        <div className="mt-2">
          <FieldErrorMessage id={errorId}>{error}</FieldErrorMessage>
        </div>
      ) : null}
    </fieldset>
  );
}

export type RadioProps = {
  value: string;
  label: string;
  /** Précision affichée sous le libellé et lue avec l'option. */
  description?: string;
  disabled?: boolean;
};

/**
 * Option d'un `RadioGroup`. Le libellé est cliquable et la ligne fait au
 * moins 44 px de haut (cible tactile).
 */
export function Radio({ value, label, description, disabled }: RadioProps) {
  const generatedId = useId();
  const itemId = `radio-${generatedId}`;
  const descriptionId = `${itemId}-description`;

  return (
    <div className="flex items-start gap-3">
      {/* Case de 44 px de haut : le bouton reste centré sur la 1re ligne du libellé. */}
      <span className="flex h-11 items-center">
        <RadioGroupItem
          id={itemId}
          value={value}
          disabled={disabled}
          aria-describedby={description ? descriptionId : undefined}
        />
      </span>
      <div className="flex min-h-11 flex-1 flex-col justify-center py-2.5">
        <label
          htmlFor={itemId}
          className={cn(
            "text-base leading-snug text-foreground",
            disabled
              ? "cursor-not-allowed text-muted-foreground"
              : "cursor-pointer in-[fieldset:disabled]:cursor-not-allowed in-[fieldset:disabled]:text-muted-foreground",
          )}
        >
          {label}
        </label>
        {description ? (
          <p id={descriptionId} className="text-base text-muted-foreground">
            {description}
          </p>
        ) : null}
      </div>
    </div>
  );
}
