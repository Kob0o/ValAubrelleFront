import { act, renderHook, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { useApi } from "@/hooks/use-api";
import { buildApiError } from "@/lib/api/errors";

function deferred<T>() {
  let resolve!: (value: T) => void;
  let reject!: (reason?: unknown) => void;
  const promise = new Promise<T>((res, rej) => {
    resolve = res;
    reject = rej;
  });
  return { promise, resolve, reject };
}

describe("useApi", () => {
  it("part de idle sans donnée ni erreur", () => {
    const { result } = renderHook(() => useApi<string>());
    expect(result.current.status).toBe("idle");
    expect(result.current.data).toBeUndefined();
    expect(result.current.error).toBeUndefined();
  });

  it("passe idle → loading → success et expose la donnée", async () => {
    const { result } = renderHook(() => useApi<{ id: string }>());
    const pending = deferred<{ id: string }>();

    let executePromise: Promise<unknown> | undefined;
    act(() => {
      executePromise = result.current.execute(async () => pending.promise);
    });

    expect(result.current.status).toBe("loading");

    await act(async () => {
      pending.resolve({ id: "ok" });
      await executePromise;
    });

    expect(result.current.status).toBe("success");
    expect(result.current.data).toEqual({ id: "ok" });
    expect(result.current.error).toBeUndefined();
  });

  it("passe en error avec une ApiError normalisée et relance l'erreur", async () => {
    const { result } = renderHook(() => useApi());
    const apiError = buildApiError({
      httpStatus: 404,
      body: { code: "NOT_FOUND" },
    });

    let caught: unknown;
    await act(async () => {
      try {
        await result.current.execute(async () => {
          throw apiError;
        });
      } catch (error) {
        caught = error;
      }
    });

    expect(result.current.status).toBe("error");
    expect(result.current.error).toMatchObject({
      code: "NOT_FOUND",
      httpStatus: 404,
    });
    expect(caught).toBe(result.current.error);
  });

  it("normalise une exception réseau inconnue", async () => {
    const { result } = renderHook(() => useApi());

    await act(async () => {
      try {
        await result.current.execute(async () => {
          throw new TypeError("Failed to fetch");
        });
      } catch {
        // attendu
      }
    });

    expect(result.current.status).toBe("error");
    expect(result.current.error).toMatchObject({
      code: "NETWORK_ERROR",
      httpStatus: 0,
    });
  });

  it("annule la requête au démontage (AbortController)", async () => {
    const { result, unmount } = renderHook(() => useApi<string>());
    const pending = deferred<string>();
    const seenSignals: AbortSignal[] = [];

    act(() => {
      void result.current.execute(async (signal) => {
        seenSignals.push(signal);
        return pending.promise;
      });
    });

    expect(result.current.status).toBe("loading");
    expect(seenSignals[0]?.aborted).toBe(false);

    unmount();

    expect(seenSignals[0]?.aborted).toBe(true);

    await act(async () => {
      pending.resolve("trop tard");
    });
  });

  it("un nouvel execute annule le précédent sans passer en error", async () => {
    const { result } = renderHook(() => useApi<string>());
    const first = deferred<string>();
    const second = deferred<string>();
    const signals: AbortSignal[] = [];

    act(() => {
      void result.current.execute(async (signal) => {
        signals.push(signal);
        return first.promise;
      });
    });

    let secondPromise: Promise<string | undefined> | undefined;
    act(() => {
      secondPromise = result.current.execute(async (signal) => {
        signals.push(signal);
        return second.promise;
      });
    });

    expect(signals[0]?.aborted).toBe(true);
    expect(result.current.status).toBe("loading");

    await act(async () => {
      first.resolve("ancien");
      second.resolve("récent");
      await secondPromise;
    });

    await waitFor(() => {
      expect(result.current.status).toBe("success");
    });
    expect(result.current.data).toBe("récent");
    expect(result.current.error).toBeUndefined();
  });

  it("reset revient à idle et annule la requête en cours", async () => {
    const { result } = renderHook(() => useApi<string>());
    const pending = deferred<string>();
    const onAbort = vi.fn();

    act(() => {
      void result.current.execute(async (signal) => {
        signal.addEventListener("abort", onAbort);
        return pending.promise;
      });
    });

    act(() => {
      result.current.reset();
    });

    expect(onAbort).toHaveBeenCalledOnce();
    expect(result.current.status).toBe("idle");
    expect(result.current.data).toBeUndefined();
    expect(result.current.error).toBeUndefined();
  });

  it("une AbortError ne bascule pas en error et revient à idle", async () => {
    const { result } = renderHook(() => useApi());

    await act(async () => {
      const value = await result.current.execute(async () => {
        throw new DOMException("Aborted", "AbortError");
      });
      expect(value).toBeUndefined();
    });

    expect(result.current.status).toBe("idle");
    expect(result.current.error).toBeUndefined();
  });
});
