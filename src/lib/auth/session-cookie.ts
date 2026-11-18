/**
 * Nom du cookie de session httpOnly posé par le serveur.
 * À confirmer par le back (#19). Valeur provisoire en attendant la réponse.
 *
 * Le front ne lit jamais la valeur du cookie (httpOnly) : le proxy vérifie
 * seulement sa présence ; le serveur reste juge de la validité.
 */
export const SESSION_COOKIE_NAME =
  process.env.SESSION_COOKIE_NAME?.trim() || "session";
