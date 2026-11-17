import { describe, expect, it } from "vitest";

import {
  buildApiError,
  errorMessages,
  getErrorMessage,
  isAbortError,
  isNotFoundLike,
  isServerError,
  isSessionExpired,
  isVersionConflict,
  normalizeError,
  normalizeResponse,
  parseRetryAfter,
} from "@/lib/api/errors";

const CORRELATION_ID = "5f0c8a52-2f5e-4c1b-9d43-0e9f0b1a7c11";

function jsonResponse(
  status: number,
  body: unknown,
  headers: Record<string, string> = {},
) {
  return new Response(body === undefined ? null : JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json", ...headers },
  });
}

describe("ErrorNormalizer : tableau du contrat", () => {
  it.each([
    [401, "INVALID_CREDENTIALS"],
    [401, "UNAUTHENTICATED"],
    [403, "FORBIDDEN"],
    [404, "NOT_FOUND"],
    [409, "VERSION_CONFLICT"],
    [422, "VALIDATION_FAILED"],
    [500, "INTERNAL_ERROR"],
  ])("%i %s donne le code et le message français", async (status, code) => {
    const error = await normalizeResponse(
      jsonResponse(status, { code, message: "raw server text" }),
    );

    expect(error.httpStatus).toBe(status);
    expect(error.code).toBe(code);
    expect(error.message).toBe(errorMessages[code]);
    expect(error.message).not.toContain("raw server text");
  });

  it.each([
    [410, "GONE"],
    [413, "PAYLOAD_TOO_LARGE"],
    [415, "UNSUPPORTED_MEDIA_TYPE"],
    [503, "SERVICE_UNAVAILABLE"],
    [429, "TOO_MANY_REQUESTS"],
  ])("%i sans code donne %s", async (status, code) => {
    const error = await normalizeResponse(jsonResponse(status, undefined));
    expect(error.code).toBe(code);
    expect(error.message).toBe(errorMessages[code]);
  });

  it("409 VERSION_CONFLICT conserve details.current.version", async () => {
    const error = await normalizeResponse(
      jsonResponse(409, {
        code: "VERSION_CONFLICT",
        message: "conflict",
        details: { current: { version: 7 } },
      }),
    );
    expect(isVersionConflict(error)).toBe(true);
    expect(error.details).toEqual({ current: { version: 7 } });
  });

  it("422 VALIDATION_FAILED conserve les erreurs par champ", async () => {
    const error = await normalizeResponse(
      jsonResponse(422, {
        code: "VALIDATION_FAILED",
        message: "invalid",
        fields: { subject: "required", message: "too_long" },
      }),
    );
    expect(error.fields).toEqual({ subject: "required", message: "too_long" });
  });

  it("503 lit l'en-tête Retry-After", async () => {
    const error = await normalizeResponse(
      jsonResponse(503, undefined, { "Retry-After": "30" }),
    );
    expect(error.retryAfterSeconds).toBe(30);
  });

  it("429 lit Retry-After s'il est présent, sinon s'en passe", async () => {
    const withHeader = await normalizeResponse(
      jsonResponse(429, undefined, { "Retry-After": "5" }),
    );
    const withoutHeader = await normalizeResponse(jsonResponse(429, undefined));
    expect(withHeader.message).toBe("Trop de requêtes, réessayez dans un instant.");
    expect(withHeader.retryAfterSeconds).toBe(5);
    expect(withoutHeader.retryAfterSeconds).toBeUndefined();
  });
});

describe("ErrorNormalizer : règles transverses", () => {
  it("un 401 INVALID_CREDENTIALS n'est pas une session expirée", () => {
    const login = buildApiError({ httpStatus: 401, body: { code: "INVALID_CREDENTIALS" } });
    const expired = buildApiError({ httpStatus: 401, body: { code: "UNAUTHENTICATED" } });
    const noCode = buildApiError({ httpStatus: 401 });

    expect(isSessionExpired(login)).toBe(false);
    expect(isSessionExpired(expired)).toBe(true);
    expect(isSessionExpired(noCode)).toBe(true);
  });

  it("un 403 et un 404 produisent le même message", () => {
    const forbidden = buildApiError({ httpStatus: 403, body: { code: "FORBIDDEN" } });
    const notFound = buildApiError({ httpStatus: 404, body: { code: "NOT_FOUND" } });
    expect(forbidden.message).toBe(notFound.message);
    expect(isNotFoundLike(forbidden)).toBe(true);
    expect(isNotFoundLike(notFound)).toBe(true);
  });

  it("un 5xx garde le correlationId et aucun détail technique", async () => {
    const error = await normalizeResponse(
      jsonResponse(500, {
        code: "INTERNAL_ERROR",
        message: "NullPointerException at Foo.java:42",
        details: undefined,
        correlationId: CORRELATION_ID,
      }),
    );
    expect(isServerError(error)).toBe(true);
    expect(error.correlationId).toBe(CORRELATION_ID);
    expect(JSON.stringify(error)).not.toContain("NullPointerException");
  });

  it("prend le correlationId de l'en-tête si le corps n'en a pas", async () => {
    const error = await normalizeResponse(
      new Response("<html>Bad gateway</html>", {
        status: 502,
        headers: { "X-Correlation-Id": CORRELATION_ID },
      }),
    );
    expect(error.code).toBe("INTERNAL_ERROR");
    expect(error.correlationId).toBe(CORRELATION_ID);
  });

  it("compare les codes sans tenir compte de la casse", () => {
    const error = buildApiError({ httpStatus: 401, body: { code: "invalid_credentials" } });
    expect(error.code).toBe("INVALID_CREDENTIALS");
    expect(isSessionExpired(error)).toBe(false);
    expect(getErrorMessage({ code: "not_found", httpStatus: 404 })).toBe(
      errorMessages.NOT_FOUND,
    );
  });

  it("un code inconnu donne le message du statut HTTP", () => {
    const client = buildApiError({ httpStatus: 400, body: { code: "BRAND_NEW_CODE" } });
    const server = buildApiError({ httpStatus: 500, body: { code: "BRAND_NEW_CODE" } });
    expect(client.code).toBe("BRAND_NEW_CODE");
    expect(client.message).toMatch(/Vérifiez les informations/);
    expect(server.message).toBe(errorMessages.INTERNAL_ERROR);
  });

  it.each([400, 405])(
    "un %i sans corps donne REQUEST_FAILED et le message 4xx",
    async (status) => {
      const error = await normalizeResponse(new Response(null, { status }));
      expect(error.code).toBe("REQUEST_FAILED");
      expect(errorMessages.REQUEST_FAILED).toBeUndefined();
      expect(error.message).toBe(
        "La demande n'a pas pu aboutir. Vérifiez les informations saisies.",
      );
      expect(isServerError(error)).toBe(false);
    },
  );

  it("un 5xx non listé sans corps donne INTERNAL_ERROR", () => {
    const error = buildApiError({ httpStatus: 504 });
    expect(error.code).toBe("INTERNAL_ERROR");
    expect(error.message).toBe(errorMessages.INTERNAL_ERROR);
  });

  it("chaque code métier des inventaires a un message", () => {
    for (const code of [
      "ALREADY_ASSIGNED",
      "NOT_ASSIGNEE",
      "REQUEST_NOT_AWAITING_DETAILS",
      "SECTION_LOCKED",
      "SECTION_HAS_NO_SOURCE",
      "EDIT_UNCHANGED",
      "PUBLISH_FORBIDDEN",
      "PUBLIC_PUBLISH_FORBIDDEN",
      "REPORT_WITHDRAWN",
      "VERSION_NOT_PUBLISHED",
      "PDF_NOT_READY",
      "PDF_GENERATION_FAILED",
      "CONTEXT_INCOMPLETE",
      "SNAPSHOT_EXPIRED",
      "INVALID_PERIOD",
    ]) {
      expect(errorMessages[code]?.length ?? 0).toBeGreaterThan(0);
    }
  });
});

describe("normalizeError (exceptions)", () => {
  it("une erreur fetch devient NETWORK_ERROR", () => {
    const error = normalizeError(new TypeError("Failed to fetch"));
    expect(error).toMatchObject({ code: "NETWORK_ERROR", httpStatus: 0 });
    expect(error.message).toBe(errorMessages.NETWORK_ERROR);
  });

  it("un timeout devient NETWORK_ERROR", () => {
    const timeout = new DOMException("The operation timed out.", "TimeoutError");
    expect(normalizeError(timeout).code).toBe("NETWORK_ERROR");
  });

  it("repère une annulation volontaire", () => {
    expect(isAbortError(new DOMException("Aborted", "AbortError"))).toBe(true);
    expect(isAbortError(new TypeError("Failed to fetch"))).toBe(false);
    expect(isAbortError("AbortError")).toBe(false);
  });

  it("une ApiError déjà formée est conservée et son message remplacé", () => {
    const error = normalizeError({
      code: "version_conflict",
      message: "raw",
      httpStatus: 409,
      details: { current: { version: 2 } },
      retryAfterSeconds: 3,
    });
    expect(error).toEqual({
      code: "VERSION_CONFLICT",
      message: errorMessages.VERSION_CONFLICT,
      httpStatus: 409,
      details: { current: { version: 2 } },
      retryAfterSeconds: 3,
    });
  });
});

describe("parseRetryAfter", () => {
  it("lit des secondes ou une date HTTP", () => {
    const now = Date.parse("2026-11-17T10:00:00Z");
    expect(parseRetryAfter("120", now)).toBe(120);
    expect(parseRetryAfter("Tue, 17 Nov 2026 10:01:00 GMT", now)).toBe(60);
    expect(parseRetryAfter("n'importe quoi", now)).toBeUndefined();
    expect(parseRetryAfter(null, now)).toBeUndefined();
  });
});
