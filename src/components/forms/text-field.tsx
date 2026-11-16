"use client";

import type { ComponentProps } from "react";
import { cn } from "cn";

import { Input } from "@/components/ui/input";
import {
  FieldWrapper,
  fieldControlClassName,
} from "@/components/forms/field-wrapper";

type NativeInputProps = Omit<
  ComponentProps<"input">,
  | "value"
  | "onChange"
  | "type"
  | "name"
  | "required"
  | "maxLength"
  | "disabled"
  | "readOnly"
  | "children"
>;

export type TextFieldProps = NativeInputProps & {
  label: string;
  name: string;
  value: string;
  onChange: (value: string) => void;
  type?: "text" | "email" | "password";
  /** Message d'erreur, par ex. `getFieldError(apiError, name)` sur un 422. */
  error?: string;
  /**
   * Aide : consigne qui doit rester lisible pendant la saisie (format,
   * contrainte, précision). Toujours ici, jamais dans `placeholder`.
   */
  hint?: string;
  /**
   * Exemple de valeur, facultatif : « Ex. : Marie Dupont ».
   * Jamais une consigne ni un libellé : il disparaît dès la saisie,
   * se confond avec une valeur remplie et est mal lu par les lecteurs d'écran.
   */
  placeholder?: string;
  required?: boolean;
  maxLength?: number;
  /** Affiche « n / max caractères » ; nécessite `maxLength`. */
  showCounter?: boolean;
  disabled?: boolean;
  readOnly?: boolean;
};

export function TextField({
  label,
  name,
  value,
  onChange,
  type = "text",
  error,
  hint,
  required = false,
  maxLength,
  showCounter = false,
  disabled = false,
  readOnly = false,
  id,
  className,
  ...inputProps
}: TextFieldProps) {
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
        <Input
          {...inputProps}
          {...control}
          name={name}
          type={type}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          required={required}
          maxLength={maxLength}
          disabled={disabled}
          readOnly={readOnly}
          data-readonly={readOnly || undefined}
          className={cn(
            fieldControlClassName,
            "data-readonly:border-dashed data-readonly:bg-[var(--color-surface-alt)]",
            className,
          )}
        />
      )}
    </FieldWrapper>
  );
}
