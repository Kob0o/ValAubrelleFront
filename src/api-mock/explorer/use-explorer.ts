"use client";

import { useCallback, useEffect, useState } from "react";
import type { MapError } from "@/components/explorer/map-view/types";
import type { ExplorerDataSource, ExplorerQuery, ExplorerResponse } from "./types";
import { ExplorerRequestError } from "./data-source";

export function useExplorer(query: ExplorerQuery, dataSource: ExplorerDataSource) {
  const [attempt, setAttempt] = useState(0);
  const [result, setResult] = useState<{ query: ExplorerQuery; attempt: number; data?: ExplorerResponse; years?: ExplorerResponse["years"]; error?: MapError }>();
  useEffect(() => {
    const controller = new AbortController();
    Promise.resolve().then(() => dataSource(query, { signal: controller.signal })).then(
      (data) => { if (!controller.signal.aborted) setResult({ query, attempt, data, years: data.years }); },
      (cause: unknown) => {
        if (controller.signal.aborted) return;
        const error: MapError = cause instanceof ExplorerRequestError
          ? { status: cause.status, ...cause.body }
          : { status: 503, message: "Impossible de charger les données de l’explorateur." };
        setResult((previous) => ({ query, attempt, error, years: previous?.years }));
      },
    );
    return () => controller.abort();
  }, [query, dataSource, attempt]);
  const retry = useCallback(() => setAttempt((value) => value + 1), []);
  const isLoading = result?.query !== query || result?.attempt !== attempt;
  return { data: result?.data, years: result?.years, resolvedQuery: result?.query, error: isLoading ? undefined : result?.error, isLoading, retry };
}
