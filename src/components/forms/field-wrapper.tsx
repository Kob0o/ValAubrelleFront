import { useId, type ReactNode } from "react";
import { CircleAlert } from "lucide-react";
import { cn } from "cn";

import { Label } from "@/components/ui/label";

/** Attributs à poser sur le contrôle pour le relier au libellé, à l'aide et à l'erreur. */
export type FieldControlProps = {
  id: string;
  "aria-describedby"?: string;
  "aria-invalid"?: true;
  "aria-required"?: true;
};

export type FieldWrapperProps = {
  label: string;
  /** Identifiant du contrôle ; généré si absent. */
  id?: string;
  /**
   * Consigne affichée sous le libellé et annoncée avec le champ.
   * Règle : la consigne va ici ; le placeholder ne porte qu'un exemple de valeur.
   */
  hint?: string;
  error?: string;
  required?: boolean;
  /** Texte affiché sous le champ et lu avec lui (compteur de caractères…). */
  footer?: string;
  className?: string;
  children: (control: FieldControlProps) => ReactNode;
};

/**
 * Libellé + aide + erreur partagés par TextField, Select et les futurs champs
 * (TextArea, PasswordField, MultiSelect…). Les styles des contrôles
 * (taille, contraste, focus, états) sont dans les primitives `components/ui`.
 * Le libellé est toujours visible ; l'erreur n'est jamais portée par la couleur seule.
 */
export function FieldWrapper({
  label,
  id,
  hint,
  error,
  required = false,
  footer,
  className,
  children,
}: FieldWrapperProps) {
  const generatedId = useId();
  const controlId = id ?? `field-${generatedId}`;
  const hintId = `${controlId}-hint`;
  const errorId = `${controlId}-error`;
  const footerId = `${controlId}-footer`;

  const describedBy =
    [hint && hintId, error && errorId, footer && footerId]
      .filter(Boolean)
      .join(" ") || undefined;

  return (
    <div className={cn("flex flex-col gap-2", className)} data-slot="field">
      <Label htmlFor={controlId} className="flex-wrap gap-1">
        {label}
        {required ? (
          <span className="font-normal text-muted-foreground">
            <span aria-hidden="true">* </span>(obligatoire)
          </span>
        ) : null}
      </Label>

      {hint ? (
        <p id={hintId} className="text-base text-muted-foreground">
          {hint}
        </p>
      ) : null}

      {children({
        id: controlId,
        "aria-describedby": describedBy,
        "aria-invalid": error ? true : undefined,
        "aria-required": required ? true : undefined,
      })}

      {error ? (
        <p id={errorId} className="flex items-start gap-2 text-base text-destructive">
          {/* Icône 16 px centrée sur la 1re ligne (interligne 24 px). */}
          <CircleAlert aria-hidden="true" className="mt-1 size-4 shrink-0" />
          <span>
            <span className="sr-only">Erreur : </span>
            {error}
          </span>
        </p>
      ) : null}

      {footer ? (
        <p id={footerId} className="text-base text-muted-foreground">
          {footer}
        </p>
      ) : null}
    </div>
  );
}
