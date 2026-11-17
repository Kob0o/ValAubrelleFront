"use client";

import { useId } from "react";
import { cn } from "cn";

import {
  FieldErrorMessage,
  describedByIds,
} from "@/components/forms/field-wrapper";
import { Badge } from "@/components/ui/badge";
import { Checkbox as CheckboxPrimitive } from "@/components/ui/checkbox";

export type CheckboxState = boolean | "indeterminate";

export type CheckboxProps = {
  label: string;
  name?: string;
  /** `"indeterminate"` : sélection partielle (`aria-checked="mixed"`). */
  checked: CheckboxState;
  /** Toujours un booléen : cliquer une case indéterminée la coche. */
  onChange: (checked: boolean) => void;
  /** Précision affichée sous le libellé et lue avec la case. */
  description?: string;
  error?: string;
  required?: boolean;
  disabled?: boolean;
  /** Valeur envoyée avec le formulaire quand la case est cochée. */
  value?: string;
  id?: string;
  className?: string;
};

/**
 * Case à cocher : libellé cliquable, ligne d'au moins 44 px de haut.
 * États : décochée · cochée · indéterminée · focus · désactivée · erreur.
 * Espace coche ou décoche (Radix).
 */
export function Checkbox({
  label,
  name,
  checked,
  onChange,
  description,
  error,
  required = false,
  disabled = false,
  value,
  id,
  className,
}: CheckboxProps) {
  const generatedId = useId();
  const controlId = id ?? `checkbox-${generatedId}`;
  const descriptionId = `${controlId}-description`;
  const errorId = `${controlId}-error`;

  return (
    <div className={cn("flex flex-col gap-1", className)} data-slot="field">
      <div className="flex items-start gap-3">
        {/* Case de 44 px de haut : la case reste centrée sur la 1re ligne du libellé. */}
        <span className="flex h-11 items-center">
          <CheckboxPrimitive
            id={controlId}
            name={name}
            value={value}
            checked={checked}
            onCheckedChange={(next) => onChange(next === true)}
            required={required}
            disabled={disabled}
            aria-describedby={describedByIds(
              description && descriptionId,
              error && errorId,
            )}
            aria-invalid={error ? true : undefined}
            aria-required={required ? true : undefined}
          />
        </span>
        <div className="flex min-h-11 flex-1 flex-col justify-center py-2.5">
          <label
            htmlFor={controlId}
            className={cn(
              "text-base leading-snug",
              disabled
                ? "cursor-not-allowed text-muted-foreground"
                : "cursor-pointer text-foreground",
            )}
          >
            {label}
          </label>
          {/* Indication visuelle, comme FieldWrapper ; `aria-required` l'annonce déjà. */}
          {required ? (
            <Badge variant="secondary" aria-hidden="true" className="mt-1 self-start">
              Obligatoire
            </Badge>
          ) : null}
          {description ? (
            <p id={descriptionId} className="text-base text-muted-foreground">
              {description}
            </p>
          ) : null}
        </div>
      </div>
      {error ? <FieldErrorMessage id={errorId}>{error}</FieldErrorMessage> : null}
    </div>
  );
}
