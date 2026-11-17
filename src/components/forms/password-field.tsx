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
  /**
   * Règles du mot de passe : résumées sous le champ en un seul message
   * (icône **et** texte) qui cumule celles non respectées.
   */
  rules?: PasswordRule[];
  error?: string;
  /** Consigne affichée dans l'infobulle d'aide (jamais dans `placeholder`). */
  hint?: string;
  required?: boolean;
  disabled?: boolean;
};

/**
 * Mot de passe : même libellé, aide et erreur que `TextField` (`FieldWrapper`),
 * bouton afficher / masquer (`IconButton`) et message des règles.
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

const listFormat = new Intl.ListFormat("fr", {
  style: "long",
  type: "conjunction",
});

export type PasswordRulesStatus = {
  /** `all-met` : tout est respecté ; `none-met` : rien encore ; `missing` : en partie. */
  state: "all-met" | "none-met" | "missing";
  message: string;
};

/**
 * Un seul message qui cumule les règles non respectées (au lieu d'une ligne
 * par règle) : « Il manque : une majuscule et un chiffre. »
 */
export function passwordRulesStatus(rules: PasswordRule[]): PasswordRulesStatus {
  const missing = rules.filter((rule) => !rule.met).map((rule) => rule.label);

  if (missing.length === 0) {
    return {
      state: "all-met",
      message: "Le mot de passe respecte toutes les règles.",
    };
  }
  if (missing.length === rules.length) {
    return {
      state: "none-met",
      message: `Le mot de passe doit contenir : ${listFormat.format(missing)}.`,
    };
  }
  return {
    state: "missing",
    message: `Il manque : ${listFormat.format(missing)}.`,
  };
}

function PasswordRules({ rules }: { rules: PasswordRule[] }) {
  const { state, message } = passwordRulesStatus(rules);
  const allMet = state === "all-met";

  return (
    <p
      data-rules-state={state}
      className={cn(
        "flex items-start gap-2 text-base",
        allMet ? "text-[var(--color-success)]" : "text-muted-foreground",
      )}
    >
      {/* Icône + texte : l'état n'est jamais porté par la couleur seule. */}
      <span className="flex h-[1lh] shrink-0 items-center">
        {allMet ? (
          <CircleCheck aria-hidden="true" className="size-4" />
        ) : (
          <CircleX aria-hidden="true" className="size-4" />
        )}
      </span>
      <span>{message}</span>
    </p>
  );
}
