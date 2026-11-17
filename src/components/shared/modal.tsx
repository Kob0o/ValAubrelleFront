"use client";

import { X } from "lucide-react";
import { cn } from "cn";
import type { ReactNode } from "react";

import { IconButton } from "@/components/shared/icon-button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useRestoreFocus } from "@/hooks/use-restore-focus";

export interface ModalProps {
  /** Contrôle l'ouverture (composant contrôlé par le parent). */
  open: boolean;
  /** Appelé à la fermeture (Échap, clic sur l'overlay, bouton Fermer). */
  onClose: () => void;
  /** Titre de la fenêtre (obligatoire : nom accessible du dialogue). */
  title: string;
  /** Description annoncée par le lecteur d'écran. */
  description?: string;
  /** Contenu de la fenêtre ; défile en interne s'il est long. */
  children: ReactNode;
  /** Pied de fenêtre : boutons d'action (Button). */
  footer?: ReactNode;
  /** Largeur sur bureau ; plein écran à 390 px dans tous les cas. */
  size?: "sm" | "md" | "lg";
}

const sizeClasses = {
  sm: "sm:max-w-sm",
  md: "sm:max-w-lg",
  lg: "sm:max-w-2xl",
} as const;

/**
 * Fenêtre modale partagée. Le piège à focus, la fermeture par Échap
 * et le retour du focus sur le déclencheur sont assurés par la
 * primitive Radix (Dialog) — ne pas les réimplémenter.
 */
export function Modal({
  open,
  onClose,
  title,
  description,
  children,
  footer,
  size = "md",
}: ModalProps) {
  useRestoreFocus(open);

  return (
    <Dialog
      open={open}
      onOpenChange={(isOpen) => {
        if (!isOpen) {
          onClose();
        }
      }}
    >
      <DialogContent
        showCloseButton={false}
        className={cn(
          "flex max-h-[85dvh] flex-col",
          sizeClasses[size],
          // Plein écran à 390 px
          "max-sm:top-0 max-sm:left-0 max-sm:h-dvh max-sm:max-h-none max-sm:w-full max-sm:max-w-none max-sm:translate-x-0 max-sm:translate-y-0 max-sm:rounded-none",
        )}
        {...(description ? {} : { "aria-describedby": undefined })}
      >
        <div className="flex items-start justify-between gap-4">
          <DialogHeader className="gap-1">
            <DialogTitle className="text-lg font-extrabold text-[var(--color-primary-strong)]">
              {title}
            </DialogTitle>
            {description ? (
              <DialogDescription className="text-base">
                {description}
              </DialogDescription>
            ) : null}
          </DialogHeader>
          <DialogClose asChild>
            <IconButton label="Fermer" className="-m-2 shrink-0">
              <X aria-hidden="true" className="size-4" />
            </IconButton>
          </DialogClose>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto">{children}</div>

        {footer ? (
          <div className="flex flex-col-reverse gap-2 border-t border-border pt-4 sm:flex-row sm:justify-end">
            {footer}
          </div>
        ) : null}
      </DialogContent>
    </Dialog>
  );
}
