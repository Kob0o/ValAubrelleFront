import { Inbox, type LucideIcon } from "lucide-react";
import { cn } from "cn";
import type { ComponentProps, ReactNode } from "react";

export interface EmptyStateProps extends ComponentProps<"div"> {
  /** Titre principal de l'état vide. */
  title?: string;
  /** Explication ou action suggérée, facultative. */
  description?: string;
  /**
   * Action contextuelle (Button ou Link) : « Réinitialiser les filtres »,
   * « Créer une demande »… Rendue sous le texte.
   */
  action?: ReactNode;
  /** Pictogramme décoratif (toujours `aria-hidden`). Défaut : Inbox. */
  icon?: LucideIcon;
}

/**
 * État vide partagé : liste vide, recherche sans résultat…
 * Fond Brume de la charte, pictogramme décoratif (l'information
 * est portée par le titre et le texte, jamais par l'icône seule).
 */
export function EmptyState({
  title = "Aucune donnée à afficher",
  description,
  action,
  icon: Icon = Inbox,
  className,
  ...props
}: EmptyStateProps) {
  return (
    <div
      role="status"
      className={cn(
        "flex flex-col items-center gap-2 rounded-lg border border-dashed border-border bg-muted px-6 py-10 text-center",
        className,
      )}
      {...props}
    >
      <Icon aria-hidden="true" className="size-8 text-muted-foreground" />
      <p className="text-base font-semibold text-foreground">{title}</p>
      {description ? (
        <p className="text-base text-muted-foreground">{description}</p>
      ) : null}
      {action ? <div className="mt-2">{action}</div> : null}
    </div>
  );
}
