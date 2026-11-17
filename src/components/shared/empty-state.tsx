import { Inbox } from "lucide-react";
import { cn } from "cn";
import type { ComponentProps } from "react";

export interface EmptyStateProps extends ComponentProps<"div"> {
  /** Titre principal de l'état vide. */
  title?: string;
  /** Explication ou action suggérée, facultative. */
  description?: string;
}

/**
 * STUB temporaire (lot G0) — sera remplacé par le vrai composant EmptyState.
 * Ne pas enrichir : la fusion avec la version définitive est prévue au lot G3.
 */
export function EmptyState({
  title = "Aucune donnée à afficher",
  description,
  className,
  ...props
}: EmptyStateProps) {
  return (
    <div
      role="status"
      className={cn(
        "flex flex-col items-center gap-2 rounded-lg border border-dashed border-border bg-muted/50 px-6 py-10 text-center",
        className,
      )}
      {...props}
    >
      <Inbox aria-hidden="true" className="size-8 text-muted-foreground" />
      <p className="text-base font-semibold text-foreground">{title}</p>
      {description ? (
        <p className="text-sm text-muted-foreground">{description}</p>
      ) : null}
    </div>
  );
}
