import { AlertCircle, CheckCircle2, Info, TriangleAlert, X } from "lucide-react";
import { cn } from "cn";
import type { ComponentProps, ReactNode } from "react";

import { IconButton } from "@/components/shared/icon-button";

export type BannerKind = "info" | "warning" | "error" | "success";

export interface BannerProps extends ComponentProps<"div"> {
  /** Type de bannière : information, avertissement, erreur ou succès. */
  kind: BannerKind;
  /** Titre de la bannière (obligatoire : l'information n'est pas portée par la couleur seule). */
  title: string;
  /** Texte détaillé, facultatif. */
  children?: ReactNode;
  /** Action facultative (Button ou Link), rendue sous le texte. */
  action?: ReactNode;
  /**
   * Annonce au lecteur d'écran quand la bannière apparaît après une action :
   * `assertive` → `role="alert"` (réservé aux erreurs), `polite` →
   * `role="status"`. Sans `live`, la bannière est statique, sans rôle.
   */
  live?: "assertive" | "polite";
  /** Si fourni, affiche un bouton « Fermer » (≥ 44 px, libellé accessible). */
  onClose?: () => void;
}

const tones: Record<
  BannerKind,
  { icon: typeof Info; border: string; foreground: string }
> = {
  info: {
    icon: Info,
    border: "border-[var(--color-info)]",
    foreground: "text-[var(--color-info)]",
  },
  warning: {
    icon: TriangleAlert,
    border: "border-[var(--color-warning)]",
    foreground: "text-[var(--color-warning)]",
  },
  error: {
    icon: AlertCircle,
    border: "border-[var(--color-danger)]",
    foreground: "text-[var(--color-danger)]",
  },
  success: {
    icon: CheckCircle2,
    border: "border-[var(--color-success)]",
    foreground: "text-[var(--color-success)]",
  },
};

/**
 * Bannière de retour (information, avertissement, erreur, succès).
 * Fond blanc, liseré et icône dans la couleur d'état des tokens ;
 * l'information est toujours portée par l'icône ET le texte.
 */
export function Banner({
  kind,
  title,
  children,
  action,
  live,
  onClose,
  className,
  ...props
}: BannerProps) {
  const tone = tones[kind];
  const Icon = tone.icon;
  const role =
    live === "assertive" ? "alert" : live === "polite" ? "status" : undefined;

  return (
    <div
      role={role}
      className={cn(
        "flex items-start gap-3 rounded-lg border border-l-4 bg-card px-4 py-3",
        tone.border,
        className,
      )}
      {...props}
    >
      <Icon aria-hidden="true" className={cn("mt-0.5 size-5 shrink-0", tone.foreground)} />
      <div className="flex flex-1 flex-col gap-1">
        <p className={cn("text-base font-semibold", tone.foreground)}>
          {title}
        </p>
        {children ? (
          <div className="text-base text-foreground">{children}</div>
        ) : null}
        {action ? <div className="mt-1">{action}</div> : null}
      </div>
      {onClose ? (
        <IconButton label="Fermer" onClick={onClose} className="-m-1.5 shrink-0">
          <X aria-hidden="true" className="size-4" />
        </IconButton>
      ) : null}
    </div>
  );
}
