"use client";

import { useEffect, useRef } from "react";

/**
 * Rend le focus à l'élément qui avait le focus avant l'ouverture d'un
 * dialogue contrôlé (`open` / `onClose` sans `Trigger` Radix).
 *
 * Radix restaure le focus via son `Trigger` ; sans lui, la fermeture
 * renvoie le focus au `<body>`. Ce hook capture `document.activeElement`
 * à l'ouverture et le re-focusse à la fermeture (ou au démontage).
 */
export function useRestoreFocus(open: boolean) {
  const previouslyFocusedRef = useRef<Element | null>(null);

  useEffect(() => {
    if (open) {
      previouslyFocusedRef.current = document.activeElement;
      return;
    }
    const element = previouslyFocusedRef.current;
    previouslyFocusedRef.current = null;
    if (element instanceof HTMLElement && document.contains(element)) {
      element.focus({ preventScroll: true });
    }
  }, [open]);

  useEffect(
    () => () => {
      const element = previouslyFocusedRef.current;
      previouslyFocusedRef.current = null;
      if (element instanceof HTMLElement && document.contains(element)) {
        element.focus({ preventScroll: true });
      }
    },
    [],
  );
}
