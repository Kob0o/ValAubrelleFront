import { useId, type ReactNode } from "react";
import { CircleAlert } from "lucide-react";
import { cn } from "cn";

import { Label } from "@/components/ui/label";

/**
 * Classes communes à tous les contrôles de saisie (input, déclencheur de Select).
 * - 44 px de haut minimum, texte 16 px (pas de zoom iOS)
 * - bordure Gris ardoise : 3:1 minimum contre le blanc (RGAA 3.3, WCAG 1.4.11),
 *   la bordure `--color-border` de la charte est trop claire pour un champ
 * - focus : bordure + anneau Vert Aubrelle
 * - erreur : bordure plus épaisse, en plus de l'icône et du texte sous le champ
 * - désactivé : reste lisible (pas d'opacité), fond Brume
 * Les primitives de `components/ui` ne sont pas modifiées : on surcharge ici.
 */
export const fieldControlClassName = cn(
  "h-11 min-h-11 w-full rounded-[var(--radius)] border border-[var(--color-text-muted)] bg-[var(--color-surface)] px-3 py-2",
  "text-base font-normal text-[var(--color-text)] md:text-base placeholder:text-[var(--color-text-muted)]",
  "focus-visible:border-[var(--color-primary)] focus-visible:ring-2 focus-visible:ring-[var(--color-primary)]",
  "aria-invalid:border-2 aria-invalid:border-[var(--color-danger)] aria-invalid:ring-0",
  "aria-invalid:focus-visible:ring-2 aria-invalid:focus-visible:ring-[var(--color-danger)]",
  "disabled:cursor-not-allowed disabled:border-[var(--color-border)] disabled:bg-[var(--color-surface-alt)] disabled:text-[var(--color-text-muted)] disabled:opacity-100",
);

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
 * (TextArea, PasswordField, MultiSelect…).
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
      <Label
        htmlFor={controlId}
        className="flex-wrap gap-1 text-base leading-snug font-semibold text-[var(--color-text)]"
      >
        {label}
        {required ? (
          <span className="font-normal text-[var(--color-text-muted)]">
            <span aria-hidden="true">* </span>(obligatoire)
          </span>
        ) : null}
      </Label>

      {hint ? (
        <p id={hintId} className="text-base text-[var(--color-text-muted)]">
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
        <p
          id={errorId}
          className="flex items-start gap-2 text-base font-semibold text-[var(--color-danger)]"
        >
          <CircleAlert aria-hidden="true" className="mt-0.5 size-5 shrink-0" />
          <span>
            <span className="sr-only">Erreur : </span>
            {error}
          </span>
        </p>
      ) : null}

      {footer ? (
        <p id={footerId} className="text-base text-[var(--color-text-muted)]">
          {footer}
        </p>
      ) : null}
    </div>
  );
}
