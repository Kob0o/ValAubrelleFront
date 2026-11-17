import createClient, { type Client, type Middleware } from "openapi-fetch";

import {
  buildApiError,
  isAbortError,
  isApiError,
  normalizeError,
  type NormalizedApiError,
} from "@/lib/api/errors";
import { getApiBaseUrl, isMockMode } from "@/lib/api/config";
import { mockFetch } from "@/lib/api/mock-fetch";
import type { paths } from "@/types/api";

export { getApiBaseUrl, isMockMode } from "@/lib/api/config";

export type ApiClient = Client<paths>;

type ApiResult<T> = {
  data?: T;
  error?: unknown;
  response: Response;
};

/** En-tête de corrélation posé sur chaque requête (ticket G0.D). */
export const CORRELATION_ID_HEADER = "X-Correlation-Id";

function createCorrelationId(): string {
  return crypto.randomUUID();
}

/**
 * Ajoute `X-Correlation-Id` si absent. Session = cookie httpOnly via
 * `credentials: "include"` — aucun jeton envoyé à la main.
 */
export const correlationIdMiddleware: Middleware = {
  async onRequest({ request }) {
    const headers = new Headers(request.headers);
    if (!headers.has(CORRELATION_ID_HEADER)) {
      headers.set(CORRELATION_ID_HEADER, createCorrelationId());
    }
    return new Request(request, { headers });
  },
};

let clientSingleton: ApiClient | undefined;

/**
 * Client HTTP typé sur `src/types/api.d.ts` (openapi-fetch).
 * Mode mock : `NEXT_PUBLIC_API_MOCK=true` → fixtures `src/mocks/`.
 */
export function createApiClient(): ApiClient {
  const client = createClient<paths>({
    baseUrl: getApiBaseUrl(),
    credentials: "include",
    ...(isMockMode() ? { fetch: mockFetch } : {}),
  });
  client.use(correlationIdMiddleware);
  return client;
}

/** Instance partagée du client (côté navigateur / hooks client). */
export function getApiClient(): ApiClient {
  if (!clientSingleton) {
    clientSingleton = createApiClient();
  }
  return clientSingleton;
}

/** Réservé aux tests : réinitialise le singleton. */
export function resetApiClientForTests(): void {
  clientSingleton = undefined;
}

/**
 * Transforme le résultat openapi-fetch en donnée typée, ou lève une
 * `NormalizedApiError` via `ErrorNormalizer` (#6).
 *
 * On utilise `result.error` (corps déjà lu par openapi-fetch) plutôt que
 * `normalizeResponse(response)` : le body de `response` est consommé.
 * Les AbortError remontent tels quels (démontage / annulation).
 */
export async function unwrapApiResult<T>(
  resultPromise: Promise<ApiResult<T>>,
): Promise<T> {
  try {
    const result = await resultPromise;
    if (result.response.ok) {
      return result.data as T;
    }
    throw buildApiError({
      httpStatus: result.response.status,
      body: result.error,
      correlationId: result.response.headers.get(CORRELATION_ID_HEADER),
      retryAfter: result.response.headers.get("Retry-After"),
    });
  } catch (error) {
    if (isAbortError(error)) throw error;
    if (isApiError(error)) throw error;
    throw normalizeError(error);
  }
}

export type { NormalizedApiError };
