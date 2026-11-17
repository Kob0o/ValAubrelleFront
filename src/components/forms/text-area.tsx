"use client";

import type { ComponentProps } from "react";

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
  maxLength?: number;
  /** Affiche « n / max caractères » ; nécessite `maxLength`. */
  showCounter?: boolean;
  disabled?: boolean;
  readOnly?: boolean;
};

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
  const counter =
    showCounter && maxLength !== undefined
      ? `${value.length} / ${maxLength} caractères`
      : undefined;

  return (
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
          onChange={(event) => onChange(event.target.value)}
          required={required}
          maxLength={maxLength}
          disabled={disabled}
          readOnly={readOnly}
          className={className}
        />
      )}
    </FieldWrapper>
  );
}
