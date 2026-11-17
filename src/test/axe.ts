import axe from "axe-core";

/**
 * Règles d'accessibilité structurelles (libellés, ARIA, rôles).
 * Le contraste n'est pas calculable en jsdom : il est vérifié par
 * les tests de contraste sur les tokens et à l'écran avec axe DevTools.
 * Sans conteneur, le document entier est audité (utile pour les
 * dialogues, rendus dans un portail hors du conteneur de `render`).
 */
export async function axeViolations(container?: Element) {
  const results = await axe.run(container ?? document.body, {
    rules: { "color-contrast": { enabled: false }, region: { enabled: false } },
  });
  return results.violations.map(
    (violation) => `${violation.id}: ${violation.help}`,
  );
}
