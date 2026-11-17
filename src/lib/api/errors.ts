import type { ApiError } from "@/types/domain";

/**
 * ErrorNormalizer : transforme toute réponse en erreur ou exception en
 * `ApiError`. On lit `code`, jamais `message` (« clients must not interpret
 * message text ») : le `message` normalisé est toujours le texte français
 * de `errorMessages`, jamais celui du serveur. On peut donc l'afficher.
 */

export type NormalizedApiError = ApiError & {
  /** En-tête `Retry-After` (secondes) sur 429 / 503, s'il est présent. */
  retryAfterSeconds?: number;
};

/** Codes front, sans équivalent dans le contrat. */
export const FRONT_ERROR_CODES = {
  network: "NETWORK_ERROR",
  gone: "GONE",
  payloadTooLarge: "PAYLOAD_TOO_LARGE",
  unsupportedMediaType: "UNSUPPORTED_MEDIA_TYPE",
  tooManyRequests: "TOO_MANY_REQUESTS",
  serviceUnavailable: "SERVICE_UNAVAILABLE",
  /** 4xx non listé, sans code serveur : pas d'entrée dans `errorMessages`, message selon le statut. */
  requestFailed: "REQUEST_FAILED",
} as const;

const GENERIC_ERROR = "Une erreur est survenue. Réessayez dans quelques instants.";
const NOT_FOUND_MESSAGE =
  "Cette ressource est introuvable ou vous n'y avez pas accès.";

/**
 * Message français par `code` (clés en majuscules). Les 7 codes du contrat
 * v1.0.0, les codes front et les codes métier des inventaires.
 */
export const errorMessages: Readonly<Record<string, string>> = {
  // Contrat v1.0.0
  INVALID_CREDENTIALS: "Adresse e-mail ou mot de passe incorrect.",
  UNAUTHENTICATED: "Votre session a expiré. Reconnectez-vous pour continuer.",
  FORBIDDEN: NOT_FOUND_MESSAGE,
  NOT_FOUND: NOT_FOUND_MESSAGE,
  VERSION_CONFLICT:
    "Ces informations ont été modifiées entre-temps par une autre personne. Comparez les deux versions avant d'enregistrer.",
  VALIDATION_FAILED: "Certains champs sont à corriger.",
  INTERNAL_ERROR: GENERIC_ERROR,

  // Codes front
  NETWORK_ERROR:
    "Le service ne répond pas. Vérifiez votre connexion puis réessayez.",
  GONE: "Cette ressource n'est plus disponible.",
  PAYLOAD_TOO_LARGE: "Le fichier est trop lourd.",
  UNSUPPORTED_MEDIA_TYPE: "Ce type de fichier n'est pas accepté.",
  TOO_MANY_REQUESTS: "Trop de requêtes, réessayez dans un instant.",
  SERVICE_UNAVAILABLE:
    "Le service est momentanément indisponible. Réessayez dans quelques instants.",

  // Codes métier (inventaires)
  ALREADY_ASSIGNED: "Cette demande est déjà prise en charge par une autre personne.",
  NOT_ASSIGNEE: "Seule la personne en charge de cette demande peut effectuer cette action.",
  REQUEST_NOT_AWAITING_DETAILS:
    "Cette demande n'attend plus de précisions.",
  SECTION_LOCKED: "Cette section est verrouillée et ne peut plus être modifiée.",
  SECTION_HAS_NO_SOURCE:
    "Cette section doit citer au moins une source avant d'être validée.",
  EDIT_UNCHANGED: "Aucune modification à enregistrer.",
  PUBLISH_FORBIDDEN: "Vous n'avez pas le droit de publier ce rapport.",
  PUBLIC_PUBLISH_FORBIDDEN:
    "Ce rapport ne peut pas être publié pour le grand public.",
  REPORT_WITHDRAWN: "Ce rapport a été retiré.",
  VERSION_NOT_PUBLISHED: "Cette version du rapport n'est pas publiée.",
  PDF_NOT_READY: "Le PDF est en cours de préparation. Réessayez dans un instant.",
  PDF_GENERATION_FAILED: "La génération du PDF a échoué. Réessayez plus tard.",
  CONTEXT_INCOMPLETE:
    "Des informations manquent pour envoyer cette demande. Complétez le contexte.",
  SNAPSHOT_EXPIRED:
    "Les données affichées ont expiré. Rechargez la page pour les mettre à jour.",
  INVALID_PERIOD: "La période choisie n'est pas valide.",
};

/** Code utilisé quand le serveur n'en donne pas (ou pas d'exploitable). */
function codeForStatus(httpStatus: number): string {
  switch (httpStatus) {
    case 0:
      return FRONT_ERROR_CODES.network;
    case 401:
      return "UNAUTHENTICATED";
    case 403:
      return "FORBIDDEN";
    case 404:
      return "NOT_FOUND";
    case 409:
      return "VERSION_CONFLICT";
    case 410:
      return FRONT_ERROR_CODES.gone;
    case 413:
      return FRONT_ERROR_CODES.payloadTooLarge;
    case 415:
      return FRONT_ERROR_CODES.unsupportedMediaType;
    case 422:
      return "VALIDATION_FAILED";
    case 429:
      return FRONT_ERROR_CODES.tooManyRequests;
    case 503:
      return FRONT_ERROR_CODES.serviceUnavailable;
    default:
      return httpStatus >= 500
        ? "INTERNAL_ERROR"
        : FRONT_ERROR_CODES.requestFailed;
  }
}

/** Message selon le statut HTTP, pour un code inconnu. */
export function messageForStatus(httpStatus: number): string {
  if (httpStatus === 0) return errorMessages.NETWORK_ERROR;
  if (httpStatus === 403 || httpStatus === 404) return NOT_FOUND_MESSAGE;
  if (httpStatus === 401) return errorMessages.UNAUTHENTICATED;
  if (httpStatus === 409) return errorMessages.VERSION_CONFLICT;
  if (httpStatus === 410) return errorMessages.GONE;
  if (httpStatus === 413) return errorMessages.PAYLOAD_TOO_LARGE;
  if (httpStatus === 415) return errorMessages.UNSUPPORTED_MEDIA_TYPE;
  if (httpStatus === 422) return errorMessages.VALIDATION_FAILED;
  if (httpStatus === 429) return errorMessages.TOO_MANY_REQUESTS;
  if (httpStatus === 503) return errorMessages.SERVICE_UNAVAILABLE;
  if (httpStatus >= 400 && httpStatus < 500) {
    return "La demande n'a pas pu aboutir. Vérifiez les informations saisies.";
  }
  return GENERIC_ERROR;
}

/** Message français affichable : par `code`, sinon par statut HTTP. */
export function getErrorMessage(error: Pick<ApiError, "code" | "httpStatus">): string {
  return errorMessages[error.code.toUpperCase()] ?? messageForStatus(error.httpStatus);
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function stringRecord(value: unknown): Record<string, string> | undefined {
  if (!isRecord(value)) return undefined;
  const entries = Object.entries(value).filter(
    (entry): entry is [string, string] => typeof entry[1] === "string",
  );
  return entries.length > 0 ? Object.fromEntries(entries) : undefined;
}

/** `Retry-After` en secondes ; accepte aussi une date HTTP. */
export function parseRetryAfter(
  value: string | null | undefined,
  now: number = Date.now(),
): number | undefined {
  if (!value) return undefined;
  const trimmed = value.trim();
  if (/^\d+$/.test(trimmed)) return Number(trimmed);
  const date = Date.parse(trimmed);
  if (Number.isNaN(date)) return undefined;
  return Math.max(0, Math.ceil((date - now) / 1000));
}

type ErrorParts = {
  httpStatus: number;
  body?: unknown;
  correlationId?: string | null;
  retryAfter?: string | null;
};

/** Construit l'`ApiError` à partir du statut et du corps de réponse. */
export function buildApiError({
  httpStatus,
  body,
  correlationId,
  retryAfter,
}: ErrorParts): NormalizedApiError {
  const payload = isRecord(body) ? body : {};
  const serverCode =
    typeof payload.code === "string" && payload.code.trim() !== ""
      ? payload.code.trim().toUpperCase()
      : undefined;
  const code = serverCode ?? codeForStatus(httpStatus);

  const error: NormalizedApiError = {
    code,
    message: getErrorMessage({ code, httpStatus }),
    httpStatus,
  };

  const fields = stringRecord(payload.fields);
  if (fields) error.fields = fields;
  if (isRecord(payload.details)) error.details = payload.details;

  const bodyCorrelationId =
    typeof payload.correlationId === "string" ? payload.correlationId : undefined;
  const finalCorrelationId = bodyCorrelationId ?? correlationId ?? undefined;
  if (finalCorrelationId) error.correlationId = finalCorrelationId;

  const retryAfterSeconds = parseRetryAfter(retryAfter);
  if (retryAfterSeconds !== undefined) error.retryAfterSeconds = retryAfterSeconds;

  return error;
}

/**
 * Normalise une `Response` en erreur (corps JSON `ApiError` du contrat,
 * en-têtes `Retry-After` et `X-Correlation-Id`).
 */
export async function normalizeResponse(
  response: Response,
): Promise<NormalizedApiError> {
  let body: unknown;
  try {
    body = await response.clone().json();
  } catch {
    body = undefined; // corps vide, HTML de proxy, etc.
  }
  return buildApiError({
    httpStatus: response.status,
    body,
    correlationId: response.headers.get("X-Correlation-Id"),
    retryAfter: response.headers.get("Retry-After"),
  });
}

export function isApiError(value: unknown): value is ApiError {
  return (
    isRecord(value) &&
    typeof value.code === "string" &&
    typeof value.httpStatus === "number"
  );
}

/** Annulation volontaire (démontage, navigation) : à ne pas afficher. */
export function isAbortError(value: unknown): boolean {
  return (
    (value instanceof Error || isRecord(value)) &&
    (value as { name?: unknown }).name === "AbortError"
  );
}

/**
 * Normalise une exception quelconque. Une `ApiError` est re-normalisée
 * (code en majuscules, message français) ; une erreur `fetch`, un timeout
 * ou une annulation deviennent `NETWORK_ERROR`.
 */
export function normalizeError(value: unknown): NormalizedApiError {
  if (isApiError(value)) {
    const error = buildApiError({ httpStatus: value.httpStatus, body: value });
    const { retryAfterSeconds } = value as NormalizedApiError;
    if (typeof retryAfterSeconds === "number") {
      error.retryAfterSeconds = retryAfterSeconds;
    }
    return error;
  }
  return buildApiError({ httpStatus: 0 });
}

/** 401 de session expirée (pas un échec de connexion). */
export function isSessionExpired(error: Pick<ApiError, "code" | "httpStatus">): boolean {
  return (
    error.httpStatus === 401 &&
    error.code.toUpperCase() !== "INVALID_CREDENTIALS"
  );
}

/** 403 et 404 sont rendus pareil : on ne révèle pas l'existence d'une ressource. */
export function isNotFoundLike(error: Pick<ApiError, "httpStatus">): boolean {
  return error.httpStatus === 403 || error.httpStatus === 404;
}

export function isVersionConflict(error: Pick<ApiError, "code" | "httpStatus">): boolean {
  return error.httpStatus === 409 && error.code.toUpperCase() === "VERSION_CONFLICT";
}

/** Erreurs 5xx : message générique et `correlationId` copiable. */
export function isServerError(error: Pick<ApiError, "httpStatus">): boolean {
  return error.httpStatus >= 500;
}
