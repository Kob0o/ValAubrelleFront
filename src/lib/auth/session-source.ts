import type { User } from "@/types/domain";
import { ROLES, type Role } from "@/types/roles";

/**
 * Source temporaire de session côté client (G0.D), en attendant `GET /me` (#18).
 * Données non secrètes uniquement : nom, e-mail, rôle, codes communes.
 * Isolée ici pour basculer sur `/me` sans toucher à `useAuth`.
 *
 * Exposée via un store externe (`useSyncExternalStore`) pour éviter un
 * `setState` synchrone dans un `useEffect` (règle react-hooks/set-state-in-effect).
 */

export const SESSION_USER_STORAGE_KEY = "va.auth.user";

const listeners = new Set<() => void>();

/** `undefined` = pas encore hydraté depuis `sessionStorage`. */
let snapshot: User | null | undefined = undefined;

function isRole(value: unknown): value is Role {
  return typeof value === "string" && (ROLES as readonly string[]).includes(value);
}

function isUser(value: unknown): value is User {
  if (typeof value !== "object" || value === null) return false;
  const candidate = value as Record<string, unknown>;
  return (
    typeof candidate.id === "string" &&
    typeof candidate.name === "string" &&
    typeof candidate.email === "string" &&
    isRole(candidate.role) &&
    Array.isArray(candidate.municipalityCodes) &&
    candidate.municipalityCodes.every((code) => typeof code === "string")
  );
}

function canUseSessionStorage(): boolean {
  return typeof window !== "undefined" && typeof window.sessionStorage !== "undefined";
}

function readFromStorage(): User | null {
  if (!canUseSessionStorage()) return null;
  try {
    const raw = window.sessionStorage.getItem(SESSION_USER_STORAGE_KEY);
    if (!raw) return null;
    const parsed: unknown = JSON.parse(raw);
    return isUser(parsed) ? parsed : null;
  } catch {
    return null;
  }
}

function emit(): void {
  for (const listener of listeners) {
    listener();
  }
}

/** Abonnement pour `useSyncExternalStore`. */
export function subscribeSessionUser(onStoreChange: () => void): () => void {
  listeners.add(onStoreChange);
  return () => {
    listeners.delete(onStoreChange);
  };
}

/** Snapshot client (lit `sessionStorage` une fois, puis cache). */
export function getSessionUserSnapshot(): User | null {
  if (snapshot === undefined) {
    snapshot = readFromStorage();
  }
  return snapshot;
}

/** Snapshot serveur / SSR : pas de session navigateur. */
export function getServerSessionUserSnapshot(): User | null {
  return null;
}

/** Relit l'utilisateur (store + storage). */
export function readSessionUser(): User | null {
  return getSessionUserSnapshot();
}

/** Persiste l'utilisateur renvoyé par `POST /auth/session` (pas de secret). */
export function writeSessionUser(user: User): void {
  if (canUseSessionStorage()) {
    window.sessionStorage.setItem(SESSION_USER_STORAGE_KEY, JSON.stringify(user));
  }
  snapshot = user;
  emit();
}

/** Vide le cache local (logout ou 401 `UNAUTHENTICATED`). */
export function clearSessionUser(): void {
  if (canUseSessionStorage()) {
    window.sessionStorage.removeItem(SESSION_USER_STORAGE_KEY);
  }
  snapshot = null;
  emit();
}

/** Relit le storage en ignorant le cache (tests / invalidation manuelle). */
export function refreshSessionUserFromStorage(): User | null {
  snapshot = readFromStorage();
  emit();
  return snapshot;
}
