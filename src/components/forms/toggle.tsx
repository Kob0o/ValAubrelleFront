"use client";

import { useId } from "react";
import { Loader2 } from "lucide-react";
import { cn } from "cn";

import {
  FieldErrorMessage,
  describedByIds,
} from "@/components/forms/field-wrapper";
import { Switch } from "@/components/ui/switch";

export type ToggleProps = {
  label: string;
  name?: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  /** Précision affichée sous le libellé et lue avec l'interrupteur. */
  description?: string;
  error?: string;
  disabled?: boolean;
  /**
   * Changement en cours d'enregistrement côté serveur : les clics sont
   * ignorés, icône de chargement et `aria-busy`. La confirmation éventuelle
   * (dialogue) reste au composant métier (ex. `AccountStatusToggle`).
   */
  pending?: boolean;
  id?: string;
  className?: string;
};

/**
 * Interrupteur (Radix `Switch`, `role="switch"`, `aria-checked`) avec libellé
 * visible et état écrit « Activé » / « Désactivé ». Espace bascule.
 */
export function Toggle({
  label,
  name,
  checked,
  onChange,
  description,
  error,
  disabled = false,
  pending = false,
  id,
  className,
}: ToggleProps) {
  const generatedId = useId();
  const controlId = id ?? `toggle-${generatedId}`;
  const descriptionId = `${controlId}-description`;
  const errorId = `${controlId}-error`;
  const blocked = disabled || pending;

  return (
    <div className={cn("flex flex-col gap-1", className)} data-slot="field">
      <div className="flex items-start gap-3">
        <div className="flex min-h-11 flex-1 flex-col justify-center py-2.5">
          <label
            htmlFor={controlId}
            className={cn(
              "text-base leading-snug font-semibold",
              disabled ? "text-muted-foreground" : "text-foreground",
              blocked ? "cursor-not-allowed" : "cursor-pointer",
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
        <div className="flex h-11 shrink-0 items-center gap-3">
          {/*
            État écrit pour l'œil ; le lecteur d'écran l'annonce déjà via
            `role="switch"` + `aria-checked`, d'où `aria-hidden`.
          */}
          <span
            aria-hidden="true"
            className="flex min-w-24 items-center justify-end gap-2 text-base text-muted-foreground"
          >
            {pending ? (
              <>
                <Loader2 className="size-4 animate-spin motion-reduce:animate-none" />
                Enregistrement…
              </>
            ) : checked ? (
              "Activé"
            ) : (
              "Désactivé"
            )}
          </span>
          <Switch
            id={controlId}
            name={name}
            checked={checked}
            onCheckedChange={(next) => {
              if (!pending) onChange(next);
            }}
            // En attente : reste focalisable (le focus n'est pas perdu pendant
            // l'enregistrement) mais signalé indisponible et occupé.
            disabled={disabled}
            aria-disabled={pending ? true : undefined}
            aria-busy={pending ? true : undefined}
            aria-describedby={describedByIds(
              description && descriptionId,
              error && errorId,
            )}
            aria-invalid={error ? true : undefined}
          />
        </div>
      </div>
      {error ? <FieldErrorMessage id={errorId}>{error}</FieldErrorMessage> : null}
    </div>
  );
}
