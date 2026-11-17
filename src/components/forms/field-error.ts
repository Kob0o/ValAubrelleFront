import type { ApiError } from "@/types/domain";

/** Toute source portant des erreurs par champ, dont `ApiError` (422 `VALIDATION_FAILED`). */
export type FieldErrorSource = Pick<ApiError, "fields"> | null | undefined;

/** Message d'erreur du champ `name`, à passer à la prop `error` d'un champ. */
export function getFieldError(
  source: FieldErrorSource,
  name: string,
): string | undefined {
  const message = source?.fields?.[name];
  return message ? message : undefined;
}
