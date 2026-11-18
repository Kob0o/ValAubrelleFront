"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  useSyncExternalStore,
  type ReactNode,
} from "react";
import { useRouter } from "next/navigation";

import { getApiClient, unwrapApiResult } from "@/lib/api/client";
import {
  clearSessionUser,
  getServerSessionUserSnapshot,
  getSessionUserSnapshot,
  subscribeSessionUser,
  writeSessionUser,
} from "@/lib/auth/session-source";
import {
  getCurrentReturnUrl,
  setSessionExpiredHandler,
} from "@/lib/auth/session-expired";
import type { User } from "@/types/domain";
import type { AppRole } from "@/types/roles";

/** États de session côté client (G0.D). */
export type AuthStatus = "unknown" | "authenticated" | "expired";

export type LoginInput = {
  email: string;
  password: string;
  returnUrl?: string | null;
};

export type AuthContextValue = {
  user: User | null;
  status: AuthStatus;
  login: (input: LoginInput) => Promise<{ redirectUrl: string }>;
  logout: () => Promise<void>;
  hasRole: (...roles: AppRole[]) => boolean;
  /** Passe en `expired`, vide le cache local et redirige vers `/login`. */
  markExpired: (returnUrl?: string) => void;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const user = useSyncExternalStore(
    subscribeSessionUser,
    getSessionUserSnapshot,
    getServerSessionUserSnapshot,
  );
  /** `expired` n'est pas dans le storage : flag local après 401. */
  const [expired, setExpired] = useState(false);

  const status: AuthStatus = expired
    ? "expired"
    : user
      ? "authenticated"
      : "unknown";

  const markExpired = useCallback(
    (returnUrl?: string) => {
      clearSessionUser();
      setExpired(true);
      const target = returnUrl ?? getCurrentReturnUrl();
      router.replace(`/login?returnUrl=${encodeURIComponent(target)}`);
    },
    [router],
  );

  useEffect(() => {
    setSessionExpiredHandler((returnUrl) => {
      markExpired(returnUrl);
    });
    return () => setSessionExpiredHandler(null);
  }, [markExpired]);

  const login = useCallback(
    async ({ email, password, returnUrl }: LoginInput) => {
      const data = await unwrapApiResult(
        getApiClient().POST("/auth/session", {
          body: { email, password, returnUrl: returnUrl ?? null },
        }),
      );
      writeSessionUser(data.user);
      setExpired(false);
      router.push(data.redirectUrl);
      return { redirectUrl: data.redirectUrl };
    },
    [router],
  );

  const logout = useCallback(async () => {
    try {
      await unwrapApiResult(getApiClient().DELETE("/auth/session"));
    } finally {
      clearSessionUser();
      setExpired(false);
    }
  }, []);

  const hasRole = useCallback(
    (...roles: AppRole[]) => {
      if (!user) return roles.includes("visitor");
      return roles.includes(user.role);
    },
    [user],
  );

  const value = useMemo<AuthContextValue>(
    () => ({ user, status, login, logout, hasRole, markExpired }),
    [user, status, login, logout, hasRole, markExpired],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth doit être utilisé dans un AuthProvider.");
  }
  return context;
}
