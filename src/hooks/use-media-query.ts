"use client";

import { useSyncExternalStore } from "react";

/**
 * Abonnement à une media query, compatible SSR (rendu serveur : false).
 * @example useMediaQuery("(max-width: 639px)") // mobile < 640 px
 */
export function useMediaQuery(query: string): boolean {
  return useSyncExternalStore(
    (callback) => {
      const mediaQueryList = window.matchMedia(query);
      mediaQueryList.addEventListener("change", callback);
      return () => mediaQueryList.removeEventListener("change", callback);
    },
    () => window.matchMedia(query).matches,
    () => false,
  );
}
