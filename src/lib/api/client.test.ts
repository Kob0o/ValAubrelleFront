import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import {
  CORRELATION_ID_HEADER,
  createApiClient,
  getApiBaseUrl,
  isMockMode,
  resetApiClientForTests,
  unwrapApiResult,
} from "@/lib/api/client";
import { isAbortError, isSessionExpired } from "@/lib/api/errors";
import { MOCK_PASSWORD, mockUser } from "@/mocks/auth";

const MOCK_BASE_URL = "http://mock.local/api/v1";

describe("config client API", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("utilise /api/v1 par défaut", () => {
    vi.stubEnv("NEXT_PUBLIC_API_BASE_URL", "");
    expect(getApiBaseUrl()).toBe("/api/v1");
  });

  it("retire le slash final de NEXT_PUBLIC_API_BASE_URL", () => {
    vi.stubEnv("NEXT_PUBLIC_API_BASE_URL", "https://api.example.com/api/v1/");
    expect(getApiBaseUrl()).toBe("https://api.example.com/api/v1");
  });

  it("active le mode mock seulement si NEXT_PUBLIC_API_MOCK=true", () => {
    vi.stubEnv("NEXT_PUBLIC_API_MOCK", "true");
    expect(isMockMode()).toBe(true);
    vi.stubEnv("NEXT_PUBLIC_API_MOCK", "1");
    expect(isMockMode()).toBe(false);
  });
});

describe("client HTTP (mode mock)", () => {
  beforeEach(() => {
    vi.stubEnv("NEXT_PUBLIC_API_MOCK", "true");
    // URL absolue : jsdom / Node ne résolvent pas `/api/v1/...` comme le navigateur.
    vi.stubEnv("NEXT_PUBLIC_API_BASE_URL", MOCK_BASE_URL);
    resetApiClientForTests();
  });

  afterEach(() => {
    vi.unstubAllEnvs();
    resetApiClientForTests();
  });

  it("envoie X-Correlation-Id sur chaque requête", async () => {
    const client = createApiClient();
    const { response } = await client.POST("/auth/session", {
      body: { email: mockUser.email, password: MOCK_PASSWORD },
    });
    expect(response.headers.get(CORRELATION_ID_HEADER)).toBeTruthy();
  });

  it("connecte avec les fixtures auth et renvoie user + redirectUrl", async () => {
    const client = createApiClient();
    const data = await unwrapApiResult(
      client.POST("/auth/session", {
        body: {
          email: mockUser.email,
          password: MOCK_PASSWORD,
          returnUrl: "/explorer",
        },
      }),
    );

    expect(data.user).toEqual(mockUser);
    expect(data.redirectUrl).toBe("/explorer");
  });

  it("normalise INVALID_CREDENTIALS sans le traiter comme session expirée", async () => {
    const client = createApiClient();

    await expect(
      unwrapApiResult(
        client.POST("/auth/session", {
          body: { email: "inconnu@example.com", password: "nope" },
        }),
      ),
    ).rejects.toMatchObject({
      httpStatus: 401,
      code: "INVALID_CREDENTIALS",
    });

    try {
      await unwrapApiResult(
        client.POST("/auth/session", {
          body: { email: "inconnu@example.com", password: "nope" },
        }),
      );
    } catch (error) {
      expect(
        isSessionExpired(error as { code: string; httpStatus: number }),
      ).toBe(false);
    }
  });

  it("déconnecte avec 204", async () => {
    const client = createApiClient();
    const data = await unwrapApiResult(client.DELETE("/auth/session"));
    expect(data).toBeUndefined();
  });

  it("sert une commune mockée par code INSEE", async () => {
    const client = createApiClient();
    const data = await unwrapApiResult(
      client.GET("/municipalities/{municipalityCode}", {
        params: {
          path: { municipalityCode: "59230" },
          query: { year: 2024 },
        },
      }),
    );
    expect(data.municipality.code).toBe("59230");
  });

  it("normalise un 404 inconnu via ErrorNormalizer", async () => {
    const client = createApiClient();
    await expect(
      unwrapApiResult(
        client.GET("/municipalities/{municipalityCode}", {
          params: {
            path: { municipalityCode: "99999" },
            query: { year: 2024 },
          },
        }),
      ),
    ).rejects.toMatchObject({
      httpStatus: 404,
      code: "NOT_FOUND",
    });
  });
});

describe("unwrapApiResult (réseau)", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
    vi.unstubAllGlobals();
    resetApiClientForTests();
  });

  it("normalise une erreur réseau en NETWORK_ERROR", async () => {
    vi.stubEnv("NEXT_PUBLIC_API_MOCK", "false");
    vi.stubEnv("NEXT_PUBLIC_API_BASE_URL", MOCK_BASE_URL);
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => {
        throw new TypeError("Failed to fetch");
      }),
    );
    resetApiClientForTests();
    const client = createApiClient();

    await expect(
      unwrapApiResult(
        client.POST("/auth/session", {
          body: { email: "a@b.c", password: "x" },
        }),
      ),
    ).rejects.toMatchObject({
      httpStatus: 0,
      code: "NETWORK_ERROR",
    });
  });

  it("laisse passer AbortError sans normalisation", async () => {
    vi.stubEnv("NEXT_PUBLIC_API_MOCK", "false");
    vi.stubEnv("NEXT_PUBLIC_API_BASE_URL", MOCK_BASE_URL);
    const abortError = new DOMException("Aborted", "AbortError");
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => {
        throw abortError;
      }),
    );
    resetApiClientForTests();
    const client = createApiClient();

    try {
      await unwrapApiResult(
        client.GET("/municipalities/{municipalityCode}", {
          params: {
            path: { municipalityCode: "59230" },
            query: { year: 2024 },
          },
        }),
      );
      expect.unreachable("devait lever AbortError");
    } catch (error) {
      expect(isAbortError(error)).toBe(true);
      expect(error).toBe(abortError);
    }
  });
});
