import { act, cleanup, renderHook, waitFor } from "@testing-library/react";
import { afterEach, expect, it, vi } from "vitest";
import { defaultExplorerQuery, mockExplorerResponse } from "@/mocks/explorer";
import { ExplorerRequestError } from "./data-source";
import type { ExplorerDataSource, ExplorerResponse } from "./types";
import { useExplorer } from "./use-explorer";

afterEach(cleanup);

it("affiche le chargement puis les données, et permet de réessayer après un 503", async () => {
  const source = vi.fn<ExplorerDataSource>().mockRejectedValueOnce(new ExplorerRequestError(503, { code: "SERVICE_UNAVAILABLE", message: "Service indisponible", correlationId: "00000000-0000-4000-8000-000000000001" })).mockResolvedValue(mockExplorerResponse);
  const { result } = renderHook(() => useExplorer(defaultExplorerQuery, source));
  expect(result.current.isLoading).toBe(true);
  await waitFor(() => expect(result.current.error?.status).toBe(503));
  expect(result.current.data).toBeUndefined();
  expect(result.current.error?.correlationId).toBeDefined();
  act(() => result.current.retry());
  await waitFor(() => expect(result.current.data).toBe(mockExplorerResponse));
  expect(result.current.error).toBeUndefined();
});

it("annule la requête précédente et ignore sa réponse tardive", async () => {
  let resolveFirst!: (response: ExplorerResponse) => void;
  const source = vi.fn<ExplorerDataSource>().mockImplementationOnce(() => new Promise((resolve) => { resolveFirst = resolve; })).mockResolvedValue(mockExplorerResponse);
  const { result, rerender } = renderHook(({ query }) => useExplorer(query, source), { initialProps: { query: defaultExplorerQuery } });
  await waitFor(() => expect(source).toHaveBeenCalledOnce());
  const firstSignal = source.mock.calls[0][1].signal;
  rerender({ query: { ...defaultExplorerQuery, municipalityCode: "59002" } });
  await waitFor(() => expect(result.current.data).toBe(mockExplorerResponse));
  expect(firstSignal.aborted).toBe(true);
  await act(async () => resolveFirst({ ...mockExplorerResponse, municipalities: [] }));
  expect(result.current.data?.municipalities).toHaveLength(32);
});
