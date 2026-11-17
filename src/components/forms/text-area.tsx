"use client";

import type { ComponentProps } from "react";
import { cn } from "cn";

import { FieldWrapper } from "@/components/forms/field-wrapper";
import { Textarea } from "@/components/ui/textarea";

type NativeTextareaProps = Omit<
  ComponentProps<"textarea">,
  | "value"
  | "onChange"
  | "name"
  | "required"
  | "maxLength"
  | "disabled"
  | "readOnly"
  | "rows"
  | "children"
>;

/** Zone de texte : mêmes règles et même API que `TextField` (G0.F). */
export type TextAreaProps = NativeTextareaProps & {
  label: string;
  name: string;
  value: string;
  onChange: (value: string) => void;
  /** Message d'erreur, par ex. `getFieldError(apiError, name)` sur un 422. */
  error?: string;
  /** Consigne affichée dans l'infobulle à côté du libellé. */
  hint?: string;
  /** Exemple de valeur uniquement, jamais une consigne. */
  placeholder?: string;
  required?: boolean;
  /** Hauteur minimale en lignes ; le champ s'agrandit ensuite avec le texte. */
  rows?: number;
  maxLength?: number;
  /** Affiche « 120 / 4 000 caractères » ; nécessite `maxLength`. */
  showCounter?: boolean;
  disabled?: boolean;
  readOnly?: boolean;
};

const numberFormat = new Intl.NumberFormat("fr-FR");

/** Seuil à partir duquel le reste est annoncé : 10 % de la limite, au moins 20 caractères. */
export function counterAnnounceThreshold(maxLength: number): number {
  return Math.max(20, Math.ceil(maxLength * 0.1));
}

/**
 * Texte annoncé au lecteur d'écran : rien loin de la limite (pas de spam),
 * puis par paliers de 10 caractères et à la limite.
 */
export function counterAnnouncement(length: number, maxLength: number): string {
  const remaining = maxLength - length;
  if (remaining <= 0) {
    return `Limite de ${numberFormat.format(maxLength)} caractères atteinte.`;
  }
  if (remaining > counterAnnounceThreshold(maxLength)) {
    return "";
  }
  // Arrondi au palier supérieur : le message ne change que tous les 10 caractères.
  const step = Math.ceil(remaining / 10) * 10;
  return `Au plus ${numberFormat.format(step)} caractères restants.`;
}

export function TextArea({
  label,
  name,
  value,
  onChange,
  error,
  hint,
  required = false,
  maxLength,
  showCounter = false,
  disabled = false,
  readOnly = false,
  rows = 10,
  id,
  className,
  ...textareaProps
}: TextAreaProps) {
  const hasCounter = showCounter && maxLength !== undefined;
  const limitReached = maxLength !== undefined && value.length >= maxLength;

  const counter = hasCounter
    ? `${numberFormat.format(value.length)} / ${numberFormat.format(maxLength)} caractères${
        limitReached ? " — limite atteinte" : ""
      }`
    : undefined;

  return (
    <>
      <FieldWrapper
        id={id}
        label={label}
        hint={hint}
        error={error}
        required={required}
        footer={counter}
      >
        {(control) => (
          <Textarea
            {...textareaProps}
            {...control}
            name={name}
            rows={rows}
            value={value}
            onChange={(event) => {
              const next = event.target.value;
              // `maxlength` bloque déjà la frappe ; on tronque aussi par sécurité.
              onChange(maxLength === undefined ? next : next.slice(0, maxLength));
            }}
            required={required}
            maxLength={maxLength}
            disabled={disabled}
            readOnly={readOnly}
            data-limit-reached={limitReached || undefined}
            // Un mot très long (URL…) passe à la ligne au lieu d'élargir le champ
            // (`field-sizing: content` prendrait sinon sa largeur).
            className={cn("[overflow-wrap:anywhere]", className)}
          />
        )}
      </FieldWrapper>
      {hasCounter && !disabled && !readOnly ? (
        <p className="sr-only" aria-live="polite" aria-atomic="true">
          {counterAnnouncement(value.length, maxLength)}
        </p>
      ) : null}
    </>
  );
}
