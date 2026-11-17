"use client";

import { useMemo } from "react";
import { toast, type ExternalToast } from "sonner";

import { CorrelationId } from "@/components/shared/correlation-id";
import { getErrorMessage, isServerError } from "@/lib/api/errors";
import type { ApiError } from "@/types/domain";

/** Durée d'affichage par défaut des toasts non bloquants (ms). */
export const DEFAULT_FEEDBACK_DURATION = 6000;

export type FeedbackAction = {
  label: string;
  onClick: () => void;
};

export type FeedbackOptions = {
  /** Texte complémentaire sous le message. */
  description?: string;
  /** Action de reprise (« Réessayer », « Annuler »…). */
  action?: FeedbackAction;
  /** Durée en ms ; ignorée pour les erreurs, qui restent jusqu'à fermeture. */
  duration?: number;
  /** Remplace un toast existant de même identifiant (pas de doublon). */
  id?: string;
};

export type ErrorFeedbackOptions = Omit<FeedbackOptions, "duration"> & {
  /** Par défaut celui de l'erreur ; affiché seulement pour les 5xx. */
  correlationId?: string;
};

export type Feedback = {
  success: (message: string, options?: FeedbackOptions) => string | number;
  info: (message: string, options?: FeedbackOptions) => string | number;
  warning: (message: string, options?: FeedbackOptions) => string | number;
  error: (error: ApiError, options?: ErrorFeedbackOptions) => string | number;
  dismiss: (id?: string | number) => void;
};

function toToastOptions({
  description,
  action,
  duration,
  id,
}: FeedbackOptions): ExternalToast {
  return {
    description,
    duration: duration ?? DEFAULT_FEEDBACK_DURATION,
    ...(id ? { id } : {}),
    ...(action
      ? { action: { label: action.label, onClick: () => action.onClick() } }
      : {}),
  };
}

const feedback: Feedback = {
  success: (message, options = {}) =>
    toast.success(message, toToastOptions(options)),
  info: (message, options = {}) => toast.info(message, toToastOptions(options)),
  warning: (message, options = {}) =>
    toast.warning(message, toToastOptions(options)),
  error: (apiError, { correlationId, description, ...options } = {}) => {
    const reference = isServerError(apiError)
      ? (correlationId ?? apiError.correlationId)
      : undefined;

    return toast.error(
      // role="alert" : annonce immédiate (la zone Sonner n'est que « polite »).
      <span role="alert">{getErrorMessage(apiError)}</span>,
      {
        ...toToastOptions(options),
        description:
          description || reference ? (
            <span className="flex flex-col gap-2">
              {description ? <span>{description}</span> : null}
              {reference ? <CorrelationId value={reference} /> : null}
            </span>
          ) : undefined,
        duration: Infinity,
        closeButton: true,
      },
    );
  },
  dismiss: (id) => {
    toast.dismiss(id);
  },
};

/**
 * Retours utilisateur (toasts Sonner montés par `UISetup`).
 * Les erreurs affichent le message français du `code`, jamais le texte du
 * serveur, et le `correlationId` copiable pour les 5xx.
 */
export function useFeedback(): Feedback {
  return useMemo(() => feedback, []);
}
