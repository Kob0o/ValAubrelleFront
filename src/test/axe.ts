import axe from "axe-core";

/**
 * Violations axe sur le document (ou un conteneur).
 * `color-contrast` est vérifié par les tests de contraste sur les tokens
 * (calcul exact, axe est peu fiable en jsdom) et `region` dépend de la page
 * hôte, pas du composant.
 */
export async function axeViolations(container?: Element) {
  const results = await axe.run(container ?? document.body, {
    rules: {
      "color-contrast": { enabled: false },
      region: { enabled: false },
    },
  });
  return results.violations;
}
