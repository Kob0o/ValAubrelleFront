import { NextResponse, type NextRequest } from "next/server";

import {
  hasSessionCookie,
  loginRedirectPath,
  shouldRedirectToLogin,
} from "@/lib/auth/proxy-auth";

/**
 * Proxy Next.js 16 (ex-`middleware.ts` du ticket G0.D).
 * Redirige vers `/login` si le cookie de session est absent.
 * Le serveur reste seul juge de la validité du cookie.
 */
export function proxy(request: NextRequest) {
  const { pathname, search } = request.nextUrl;

  if (
    shouldRedirectToLogin({
      pathname,
      hasSessionCookie: hasSessionCookie(request.cookies),
    })
  ) {
    const target = loginRedirectPath(pathname, search);
    return NextResponse.redirect(new URL(target, request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Exclut assets Next, images et fichiers statiques courants.
     * Les routes API backend sont hors de cette app (`/api/v1` proxyifié).
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
