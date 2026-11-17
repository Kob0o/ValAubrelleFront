"use client";

import { useId, useState, type ReactNode } from "react";
import { CircleAlert, Info } from "lucide-react";
import { cn } from "cn";

import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

/** Attributs à poser sur le contrôle pour le relier au libellé, à l'aide et à l'erreur. */
export type FieldControlProps = {
  id: string;
  "aria-describedby"?: string;
  "aria-invalid"?: true;
  "aria-required"?: true;
};

/** Mise en page du contrôle selon les boutons placés à sa droite. */
export type FieldLayout = {
  /** Marge droite à ajouter au contrôle pour que le texte ne passe pas sous les boutons. */
  trailingPaddingClassName?: string;
};

export type FieldWrapperProps = {
  label: string;
  /** Identifiant du contrôle ; généré si absent. */
  id?: string;
  /**
   * Consigne du champ, affichée dans une infobulle (icône d'information à
   * droite du champ) et annoncée avec le champ par les lecteurs d'écran.
   * Règle : la consigne va ici ; le placeholder ne porte qu'un exemple de valeur.
   */
  hint?: string;
  error?: string;
  required?: boolean;
  /** Texte affiché sous le champ et lu avec lui (compteur de caractères…). */
  footer?: string;
  /** Bouton placé dans le champ, avant l'aide (afficher le mot de passe…). */
  trailing?: ReactNode;
  className?: string;
  children: (control: FieldControlProps, layout: FieldLayout) => ReactNode;
};

/**
 * Bouton icône placé dans un champ : cible 44 × 44 px, icône 16 px,
 * focus visible à l'intérieur du champ.
 */
export const fieldIconButtonClassName =
  "flex size-11 shrink-0 items-center justify-center rounded-md text-muted-foreground transition-colors outline-none hover:text-foreground focus-visible:text-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-inset disabled:cursor-not-allowed disabled:hover:text-muted-foreground [&_svg]:size-4";

/** Marges droites littérales (Tailwind ne détecte pas les classes construites). */
const TRAILING_PADDING = ["", "pr-12", "pr-23"] as const;

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
  trailing,
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

  const trailingCount = (trailing ? 1 : 0) + (hint ? 1 : 0);

  return (
    <div className={cn("flex flex-col gap-2", className)} data-slot="field">
      <Label htmlFor={controlId} className="flex-wrap gap-2">
        {label}
        {required ? <Badge variant="secondary">Obligatoire</Badge> : null}
      </Label>

      {/* Texte de l'aide pour les lecteurs d'écran, lu avec le champ. */}
      {hint ? (
        <p id={hintId} className="sr-only">
          {hint}
        </p>
      ) : null}

      <div className="relative">
        {children(
          {
            id: controlId,
            "aria-describedby": describedBy,
            "aria-invalid": error ? true : undefined,
            "aria-required": required ? true : undefined,
          },
          { trailingPaddingClassName: TRAILING_PADDING[trailingCount] || undefined },
        )}
        {trailingCount > 0 ? (
          <div className="absolute inset-y-0 right-0 flex items-center">
            {trailing}
            {hint ? <FieldHint label={label} hint={hint} /> : null}
          </div>
        ) : null}
      </div>

      {error ? (
        <p id={errorId} className="flex items-start gap-2 text-base text-destructive">
          {/* Case de la hauteur d'une ligne : l'icône reste alignée sur la 1re ligne. */}
          <span className="flex h-[1lh] shrink-0 items-center">
            <CircleAlert aria-hidden="true" className="size-4" />
          </span>
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

/**
 * Icône d'information : l'aide s'affiche au survol, au focus clavier et au
 * toucher (clic), se ferme avec Échap ou en cliquant ailleurs.
 */
function FieldHint({ label, hint }: { label: string; hint: string }) {
  const [open, setOpen] = useState(false);

  return (
    <TooltipProvider>
      <Tooltip open={open} onOpenChange={setOpen}>
        <TooltipTrigger asChild>
          <button
            type="button"
            aria-label={`Aide : ${label}`}
            onClick={(event) => {
              // Garde l'infobulle ouverte au clic (Radix la fermerait), utile au toucher.
              event.preventDefault();
              setOpen(true);
            }}
            className={fieldIconButtonClassName}
          >
            <Info aria-hidden="true" />
          </button>
        </TooltipTrigger>
        <TooltipContent side="top" align="end" sideOffset={4}>
          {hint}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
