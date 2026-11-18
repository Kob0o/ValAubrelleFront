import { SESSION_COOKIE_NAME } from "@/lib/auth/session-cookie";
import { isMockMode } from "@/lib/api/config";

/**
 * Préfixes accessibles sans cookie de session.
 * `/` et `/dev` restent ouverts tant que les écrans G4 (login, shell) ne
 * sont pas branchés ; à resserrer ensuite.
 */
export const PUBLIC_PATH_PREFIXES = [
  "/login",
  "/password-reset",
  "/dev",
] as const;

export function isPublicPath(pathname: string): boolean {
  if (pathname === "/") return true;
  return PUBLIC_PATH_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`),
  );
}

/**
 * `true` si le proxy doit rediriger vers `/login?returnUrl=…`.
 * En mode mock, pas de cookie serveur : on ne redirige pas.
 */
export function shouldRedirectToLogin(options: {
  pathname: string;
  hasSessionCookie: boolean;
  mockMode?: boolean;
}): boolean {
  const mock = options.mockMode ?? isMockMode();
  if (mock) return false;
  if (isPublicPath(options.pathname)) return false;
  return !options.hasSessionCookie;
}

export function loginRedirectPath(pathname: string, search = ""): string {
  const returnUrl = `${pathname}${search}` || "/";
  return `/login?returnUrl=${encodeURIComponent(returnUrl)}`;
}

export function hasSessionCookie(
  cookieStore: { get: (name: string) => { value: string } | undefined },
  cookieName: string = SESSION_COOKIE_NAME,
): boolean {
  const value = cookieStore.get(cookieName)?.value;
  return typeof value === "string" && value.length > 0;
}
