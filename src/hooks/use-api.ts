"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import {
  isAbortError,
  isApiError,
  normalizeError,
  type NormalizedApiError,
} from "@/lib/api/errors";

/** États d'une requête gérée par `useApi` (ticket G0.D). */
export type ApiRequestStatus = "idle" | "loading" | "success" | "error";

export type UseApiResult<TData> = {
  status: ApiRequestStatus;
  data: TData | undefined;
  error: NormalizedApiError | undefined;
  /**
   * Lance une requête. Passe le `AbortSignal` au client (`fetch` / openapi-fetch).
   * En cas d'erreur API, met à jour `error` puis relance l'erreur normalisée.
   * Les annulations (démontage ou nouvel `execute`) ne passent pas en `error`.
   */
  execute: (
    request: (signal: AbortSignal) => Promise<TData>,
  ) => Promise<TData | undefined>;
  /** Repasse à `idle` et annule une requête en cours. */
  reset: () => void;
};

/**
 * Hook générique autour du client API : états + annulation au démontage.
 * Les erreurs passent par `ErrorNormalizer` (#6) si ce n'est pas déjà fait
 * (ex. via `unwrapApiResult`).
 */
export function useApi<TData = unknown>(): UseApiResult<TData> {
  const [status, setStatus] = useState<ApiRequestStatus>("idle");
  const [data, setData] = useState<TData | undefined>(undefined);
  const [error, setError] = useState<NormalizedApiError | undefined>(undefined);
  const controllerRef = useRef<AbortController | null>(null);

  useEffect(() => {
    return () => {
      controllerRef.current?.abort();
      controllerRef.current = null;
    };
  }, []);

  const reset = useCallback(() => {
    controllerRef.current?.abort();
    controllerRef.current = null;
    setStatus("idle");
    setData(undefined);
    setError(undefined);
  }, []);

  const execute = useCallback(
    async (request: (signal: AbortSignal) => Promise<TData>) => {
      controllerRef.current?.abort();
      const controller = new AbortController();
      controllerRef.current = controller;

      setStatus("loading");
      setError(undefined);

      try {
        const result = await request(controller.signal);
        if (controllerRef.current !== controller) {
          return undefined;
        }
        setData(result);
        setStatus("success");
        return result;
      } catch (caught) {
        if (controllerRef.current !== controller) {
          return undefined;
        }
        if (isAbortError(caught) || controller.signal.aborted) {
          // Annulation : pas d'état `error`. Si c'est encore notre contrôleur
          // (AbortError externe), on repasse à idle pour ne pas rester en loading.
          setStatus((current) => (current === "loading" ? "idle" : current));
          return undefined;
        }
        const normalized = isApiError(caught)
          ? (caught as NormalizedApiError)
          : normalizeError(caught);
        setError(normalized);
        setStatus("error");
        throw normalized;
      }
    },
    [],
  );

  return { status, data, error, execute, reset };
}
