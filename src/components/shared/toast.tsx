"use client";

import type { ToasterProps } from "sonner";

import { Toaster } from "@/components/ui/sonner";

/**
 * Habillage des toasts de `useFeedback` (G0.C) monté par `UISetup`.
 * - Au plus 3 toasts visibles simultanément.
 * - Bouton « Fermer » accessible sur tous les toasts (≥ 44 px,
 *   libellé français — voir `ui/sonner`).
 * - Temporisation en pause au survol et au focus (comportement natif
 *   de Sonner) ; les erreurs ne disparaissent pas automatiquement
 *   (règle de G0.C).
 * - Icône + texte dans les couleurs d'état de la charte.
 */
export function FeedbackToaster(props: ToasterProps) {
  return (
    <Toaster
      theme="light"
      position="top-right"
      visibleToasts={3}
      closeButton
      {...props}
    />
  );
}
