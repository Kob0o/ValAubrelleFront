import type { User } from "@/types/domain";
import { ROLES, type Role } from "@/types/roles";

/**
 * Source temporaire de session côté client (G0.D), en attendant `GET /me` (#18).
 * Données non secrètes uniquement : nom, e-mail, rôle, codes communes.
 * Isolée ici pour basculer sur `/me` sans toucher à `useAuth`.
 */

export const SESSION_USER_STORAGE_KEY = "va.auth.user";

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

/** Relit l'utilisateur après rechargement ; `null` si absent ou invalide. */
export function readSessionUser(): User | null {
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

/** Persiste l'utilisateur renvoyé par `POST /auth/session` (pas de secret). */
export function writeSessionUser(user: User): void {
  if (!canUseSessionStorage()) return;
  window.sessionStorage.setItem(SESSION_USER_STORAGE_KEY, JSON.stringify(user));
}

/** Vide le cache local (logout ou 401 `UNAUTHENTICATED`). */
export function clearSessionUser(): void {
  if (!canUseSessionStorage()) return;
  window.sessionStorage.removeItem(SESSION_USER_STORAGE_KEY);
}
