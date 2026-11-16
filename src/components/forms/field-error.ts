/**
 * Forme minimale d'une erreur d'API portant des erreurs par champ
 * (422 `VALIDATION_FAILED` : `fields` = nom du champ → raison).
 * Volontairement structurelle : `ApiError` (#5 G0.B) y sera compatible
 * sans que les champs de formulaire dépendent du client HTTP.
 */
export type FieldErrorSource =
  | { fields?: Record<string, string> | null }
  | null
  | undefined;

/** Message d'erreur du champ `name`, à passer à la prop `error` d'un champ. */
export function getFieldError(
  source: FieldErrorSource,
  name: string,
): string | undefined {
  const message = source?.fields?.[name];
  return message ? message : undefined;
}
