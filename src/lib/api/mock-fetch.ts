import { MOCK_PASSWORD, mockUser } from "@/mocks/auth";
import { mockMunicipalities } from "@/mocks/municipalities";

import { getApiBaseUrl } from "@/lib/api/config";

function jsonResponse(
  status: number,
  body?: unknown,
  headers: Record<string, string> = {},
): Response {
  return new Response(body === undefined ? null : JSON.stringify(body), {
    status,
    headers: {
      ...(body === undefined ? {} : { "Content-Type": "application/json" }),
      ...headers,
    },
  });
}

function apiError(
  status: number,
  code: string,
  message: string,
  correlationId: string,
): Response {
  return jsonResponse(
    status,
    { code, message, correlationId },
    { "X-Correlation-Id": correlationId },
  );
}

function pathWithinApi(requestUrl: string, baseUrl: string): string {
  const url = new URL(requestUrl, "http://mock.local");
  const base = new URL(baseUrl, "http://mock.local");
  let path = url.pathname;
  if (path.startsWith(base.pathname)) {
    path = path.slice(base.pathname.length) || "/";
  }
  if (!path.startsWith("/")) path = `/${path}`;
  return path;
}

async function readJsonBody(request: Request): Promise<unknown> {
  try {
    return await request.clone().json();
  } catch {
    return undefined;
  }
}

/**
 * `fetch` de substitution en mode mock : routes couvertes par les fixtures.
 * Les chemins non gérés renvoient 404 normalisable par `ErrorNormalizer`.
 */
export async function mockFetch(input: Request): Promise<Response> {
  const correlationId =
    input.headers.get("X-Correlation-Id") ?? crypto.randomUUID();
  const path = pathWithinApi(input.url, getApiBaseUrl());
  const method = input.method.toUpperCase();

  if (path === "/auth/session" && method === "POST") {
    const body = await readJsonBody(input);
    const email =
      typeof body === "object" &&
      body !== null &&
      typeof (body as { email?: unknown }).email === "string"
        ? (body as { email: string }).email
        : "";
    const password =
      typeof body === "object" &&
      body !== null &&
      typeof (body as { password?: unknown }).password === "string"
        ? (body as { password: string }).password
        : "";
    const returnUrl =
      typeof body === "object" &&
      body !== null &&
      typeof (body as { returnUrl?: unknown }).returnUrl === "string"
        ? (body as { returnUrl: string }).returnUrl
        : "/";

    if (email === mockUser.email && password === MOCK_PASSWORD) {
      return jsonResponse(
        200,
        { user: mockUser, redirectUrl: returnUrl || "/" },
        { "X-Correlation-Id": correlationId },
      );
    }

    return apiError(
      401,
      "INVALID_CREDENTIALS",
      "Invalid credentials",
      correlationId,
    );
  }

  if (path === "/auth/session" && method === "DELETE") {
    return new Response(null, {
      status: 204,
      headers: { "X-Correlation-Id": correlationId },
    });
  }

  const municipalityMatch = path.match(
    /^\/municipalities\/([^/]+)$/,
  );
  if (municipalityMatch && method === "GET") {
    const code = decodeURIComponent(municipalityMatch[1] ?? "");
    const municipality = mockMunicipalities.find((item) => item.code === code);
    if (!municipality) {
      return apiError(404, "NOT_FOUND", "Resource not found", correlationId);
    }
    return jsonResponse(
      200,
      {
        municipality,
        values: [],
        indicators: [],
        sources: [],
      },
      { "X-Correlation-Id": correlationId },
    );
  }

  return apiError(404, "NOT_FOUND", "Resource not found", correlationId);
}
