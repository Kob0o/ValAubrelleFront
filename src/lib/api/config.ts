/**
 * Configuration publique du client API (G0.D).
 * Les variables sont côté client : pas de secret ici.
 */

const DEFAULT_API_BASE_URL = "/api/v1";

/** Base URL des appels API (`NEXT_PUBLIC_API_BASE_URL`, défaut `/api/v1`). */
export function getApiBaseUrl(): string {
  const value = process.env.NEXT_PUBLIC_API_BASE_URL?.trim();
  if (!value) return DEFAULT_API_BASE_URL;
  return value.replace(/\/$/, "");
}

/**
 * Mode mock activé via `NEXT_PUBLIC_API_MOCK=true`.
 * Les réponses viennent alors des fixtures `src/mocks/` (pas du réseau).
 */
export function isMockMode(): boolean {
  return process.env.NEXT_PUBLIC_API_MOCK === "true";
}
