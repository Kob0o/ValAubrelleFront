"use client";

/**
 * STUB TEMPORAIRE — à remplacer par G0.E useIdempotentSubmit (#8).
 * Garantit une seule requête en vol et réutilise la même Idempotency-Key
 * tant que la soumission n'a pas réussi (nouvel essai après erreur = même clé).
 */
import { useCallback, useRef, useState } from "react";

export type SubmitOutcome<TResult> =
  | { ok: true; result: TResult }
  | { ok: false; skipped?: true };

export type IdempotentSubmitState<TResult> = {
  submit: () => Promise<SubmitOutcome<TResult>>;
  isSubmitting: boolean;
  error: unknown;
  reset: () => void;
};

function newKey() {
  return globalThis.crypto.randomUUID();
}

export function useIdempotentSubmit<TResult>(
  action: (idempotencyKey: string) => Promise<TResult>,
): IdempotentSubmitState<TResult> {
  const keyRef = useRef<string | null>(null);
  const inFlightRef = useRef(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<unknown>(null);

  const submit = useCallback(async (): Promise<SubmitOutcome<TResult>> => {
    if (inFlightRef.current) return { ok: false, skipped: true };
    inFlightRef.current = true;
    keyRef.current ??= newKey();
    setIsSubmitting(true);
    setError(null);
    try {
      const result = await action(keyRef.current);
      keyRef.current = null;
      return { ok: true, result };
    } catch (caught) {
      setError(caught);
      return { ok: false };
    } finally {
      inFlightRef.current = false;
      setIsSubmitting(false);
    }
  }, [action]);

  const reset = useCallback(() => {
    keyRef.current = null;
    setError(null);
  }, []);

  return { submit, isSubmitting, error, reset };
}
