"use client";

import { useState, type ComponentProps } from "react";
import { Eye, EyeOff } from "lucide-react";
import { cn } from "cn";

import {
  FieldWrapper,
  fieldIconButtonClassName,
} from "@/components/forms/field-wrapper";
import { Input } from "@/components/ui/input";

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
  /** `password` ajoute un bouton pour afficher ou masquer la saisie. */
  type?: "text" | "email" | "password";
  /** Message d'erreur, par ex. `getFieldError(apiError, name)` sur un 422. */
  error?: string;
  /**
   * Aide : consigne qui doit rester accessible pendant la saisie (format,
   * contrainte, précision), affichée dans l'infobulle de l'icône d'information.
   * Toujours ici, jamais dans `placeholder`.
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
  const [passwordVisible, setPasswordVisible] = useState(false);
  const isPassword = type === "password";

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
      trailing={
        isPassword ? (
          <button
            type="button"
            aria-label="Afficher le mot de passe"
            aria-pressed={passwordVisible}
            disabled={disabled}
            onClick={() => setPasswordVisible((visible) => !visible)}
            className={fieldIconButtonClassName}
          >
            {passwordVisible ? (
              <EyeOff aria-hidden="true" />
            ) : (
              <Eye aria-hidden="true" />
            )}
          </button>
        ) : undefined
      }
    >
      {(control, layout) => (
        <Input
          {...inputProps}
          {...control}
          name={name}
          type={isPassword && passwordVisible ? "text" : type}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          required={required}
          maxLength={maxLength}
          disabled={disabled}
          readOnly={readOnly}
          className={cn(layout.trailingPaddingClassName, className)}
        />
      )}
    </FieldWrapper>
  );
}
