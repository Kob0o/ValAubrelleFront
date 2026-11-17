"use client";

import { X } from "lucide-react";
import { cn } from "cn";
import type { ReactNode } from "react";

import { IconButton } from "@/components/shared/icon-button";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { useMediaQuery } from "@/hooks/use-media-query";
import { useRestoreFocus } from "@/hooks/use-restore-focus";

export interface DrawerProps {
  /** Contrôle l'ouverture (composant contrôlé par le parent). */
  open: boolean;
  /** Appelé à la fermeture (Échap, clic sur l'overlay, bouton Fermer). */
  onClose: () => void;
  /** Titre du panneau (obligatoire : nom accessible du dialogue). */
  title: string;
  /** Description annoncée par le lecteur d'écran. */
  description?: string;
  /** Contenu du panneau ; défile en interne s'il est long. */
  children: ReactNode;
  /** Pied de panneau : boutons d'action (Button). */
  footer?: ReactNode;
  /**
   * Côté d'ouverture. Par défaut : `right` sur bureau, `bottom`
   * automatiquement sur mobile (< 640 px).
   */
  side?: "right" | "bottom";
}

/**
 * Panneau latéral partagé (SourcePanel, DisclosurePanel, UserMenu,
 * menu mobile). Ouvert à droite sur bureau, en bas sur mobile.
 * Piège à focus, Échap et retour du focus assurés par Radix (Sheet).
 */
export function Drawer({
  open,
  onClose,
  title,
  description,
  children,
  footer,
  side,
}: DrawerProps) {
  const isMobile = useMediaQuery("(max-width: 639px)");
  const resolvedSide = side ?? (isMobile ? "bottom" : "right");
  useRestoreFocus(open);

  return (
    <Sheet
      open={open}
      onOpenChange={(isOpen) => {
        if (!isOpen) {
          onClose();
        }
      }}
    >
      <SheetContent
        side={resolvedSide}
        showCloseButton={false}
        className={cn(
          "text-base",
          resolvedSide === "right" && "sm:max-w-md",
          resolvedSide === "bottom" &&
            "max-h-[85dvh] rounded-t-xl border-t-2",
        )}
        {...(description ? {} : { "aria-describedby": undefined })}
      >
        <SheetHeader className="flex-row items-start justify-between gap-4 p-4 pb-0">
          <div className="flex flex-col gap-1">
            <SheetTitle className="text-lg font-extrabold text-[var(--color-primary-strong)]">
              {title}
            </SheetTitle>
            {description ? (
              <SheetDescription className="text-base">
                {description}
              </SheetDescription>
            ) : null}
          </div>
          <SheetClose asChild>
            <IconButton label="Fermer" className="shrink-0">
              <X aria-hidden="true" className="size-4" />
            </IconButton>
          </SheetClose>
        </SheetHeader>

        <div className="min-h-0 flex-1 overflow-y-auto p-4">{children}</div>

        {footer ? (
          <div className="flex flex-col-reverse gap-2 border-t border-border p-4 sm:flex-row sm:justify-end">
            {footer}
          </div>
        ) : null}
      </SheetContent>
    </Sheet>
  );
}
