"use client";

import { useState, type ComponentProps } from "react";
import { CircleCheck, CircleX, Eye, EyeOff } from "lucide-react";
import { cn } from "cn";

import { FieldWrapper } from "@/components/forms/field-wrapper";
import { IconButton } from "@/components/shared/icon-button";
import { Input } from "@/components/ui/input";
import type { PasswordRule } from "@/lib/auth/password-rules";

export type { PasswordRule };

type NativeInputProps = Omit<
  ComponentProps<"input">,
  | "value"
  | "onChange"
  | "type"
  | "name"
  | "required"
  | "disabled"
  | "readOnly"
  | "autoComplete"
  | "children"
>;

export type PasswordFieldProps = NativeInputProps & {
  label: string;
  name: string;
  value: string;
  onChange: (value: string) => void;
  /**
   * `current-password` pour la connexion, `new-password` pour la
   * réinitialisation : le gestionnaire de mots de passe propose alors d'en générer un.
   */
  autoComplete?: "current-password" | "new-password";
  /** Règles affichées sous le champ, chacune avec icône **et** texte. */
  rules?: PasswordRule[];
  error?: string;
  /** Consigne affichée dans l'infobulle d'aide (jamais dans `placeholder`). */
  hint?: string;
  required?: boolean;
  disabled?: boolean;
};

/**
 * Mot de passe : même libellé, aide et erreur que `TextField` (`FieldWrapper`),
 * bouton afficher / masquer (`IconButton`) et liste des règles.
 * Le collage reste autorisé ; la valeur n'est jamais journalisée.
 */
export function PasswordField({
  label,
  name,
  value,
  onChange,
  autoComplete = "current-password",
  rules,
  error,
  hint,
  required = false,
  disabled = false,
  id,
  className,
  ...inputProps
}: PasswordFieldProps) {
  const [visible, setVisible] = useState(false);
  const hasRules = rules !== undefined && rules.length > 0;

  return (
    <FieldWrapper
      id={id}
      label={label}
      hint={hint}
      error={error}
      required={required}
      details={hasRules ? <PasswordRules rules={rules} /> : undefined}
      trailing={
        // Libellé fixe + `aria-pressed` : le lecteur d'écran annonce
        // « Afficher le mot de passe, bouton bascule, enfoncé / non enfoncé ».
        <IconButton
          label="Afficher le mot de passe"
          aria-pressed={visible}
          disabled={disabled}
          onClick={() => setVisible((current) => !current)}
          className="rounded-md text-muted-foreground hover:bg-transparent hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-inset"
        >
          {visible ? <EyeOff aria-hidden="true" /> : <Eye aria-hidden="true" />}
        </IconButton>
      }
    >
      {(control, layout) => (
        <Input
          {...inputProps}
          {...control}
          name={name}
          type={visible ? "text" : "password"}
          autoComplete={autoComplete}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          required={required}
          disabled={disabled}
          // Désactive la correction et la capitalisation automatiques en mode visible.
          autoCapitalize="off"
          autoCorrect="off"
          spellCheck={false}
          className={cn(layout.trailingPaddingClassName, className)}
        />
      )}
    </FieldWrapper>
  );
}

function PasswordRules({ rules }: { rules: PasswordRule[] }) {
  return (
    // Pas d'aria-label : il remplacerait le texte des règles dans la description du champ.
    <ul className="flex flex-col gap-1">
      {rules.map((rule) => (
        <li
          key={rule.id}
          data-rule={rule.id}
          data-met={rule.met}
          className={cn(
            "flex items-start gap-2 text-base",
            rule.met ? "text-[var(--color-success)]" : "text-muted-foreground",
          )}
        >
          <span className="flex h-[1lh] shrink-0 items-center">
            {rule.met ? (
              <CircleCheck aria-hidden="true" className="size-4" />
            ) : (
              <CircleX aria-hidden="true" className="size-4" />
            )}
          </span>
          <span>
            {rule.label} : {rule.met ? "respectée" : "non respectée"}
          </span>
        </li>
      ))}
    </ul>
  );
}
