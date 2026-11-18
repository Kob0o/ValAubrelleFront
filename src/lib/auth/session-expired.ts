/**
 * Pont entre le client HTTP et `AuthProvider` : un 401 `UNAUTHENTICATED`
 * (hors `INVALID_CREDENTIALS`) notifie la session expirée.
 */

export type SessionExpiredHandler = (returnUrl: string) => void;

let handler: SessionExpiredHandler | null = null;

export function setSessionExpiredHandler(
  next: SessionExpiredHandler | null,
): void {
  handler = next;
}

export function getCurrentReturnUrl(): string {
  if (typeof window === "undefined") return "/";
  return `${window.location.pathname}${window.location.search}` || "/";
}

/** No-op si aucun AuthProvider n'est monté. */
export function notifySessionExpired(returnUrl?: string): void {
  handler?.(returnUrl ?? getCurrentReturnUrl());
}
