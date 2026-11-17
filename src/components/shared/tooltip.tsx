"use client";

import * as React from "react";

import {
  Tooltip as TooltipRoot,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

type TooltipProps = {
  /** Complément d'information : jamais le seul support d'une information essentielle. */
  content: React.ReactNode;
  /** Élément focusable (bouton, lien) qui déclenche l'info-bulle. */
  children: React.ReactElement;
  side?: "top" | "right" | "bottom" | "left";
  className?: string;
};

/**
 * Info-bulle ouverte au survol, au focus clavier et au toucher, fermée par
 * Échap. Le contenu reste affiché quand la souris le survole (WCAG 1.4.13).
 */
function Tooltip({ content, children, side = "top", className }: TooltipProps) {
  const [open, setOpen] = React.useState(false);
  const touch = React.useRef({ active: false, wasOpen: false });

  return (
    <TooltipProvider delayDuration={200}>
      <TooltipRoot open={open} onOpenChange={setOpen}>
        <TooltipTrigger
          asChild
          onPointerDown={(event) => {
            touch.current = {
              active: event.pointerType === "touch",
              wasOpen: open,
            };
          }}
          onClick={(event) => {
            // Radix ferme l'info-bulle au clic : au toucher, on bascule.
            if (!touch.current.active) return;
            event.preventDefault();
            setOpen(!touch.current.wasOpen);
          }}
        >
          {children}
        </TooltipTrigger>
        <TooltipContent
          side={side}
          sideOffset={4}
          className={cn(
            "bg-[color:var(--color-text)] text-base font-normal text-[color:var(--color-on-primary)]",
            className,
          )}
        >
          {content}
        </TooltipContent>
      </TooltipRoot>
    </TooltipProvider>
  );
}

export { Tooltip };
export type { TooltipProps };
