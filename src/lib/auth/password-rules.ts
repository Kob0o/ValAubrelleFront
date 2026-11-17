/**
 * Règles de mot de passe par défaut, en attendant que le back les fixe
 * (le contrat ne donne que `failedRules: string[]` sur
 * `POST /auth/password-reset/confirm`).
 *
 * Base : recommandation de la CNIL (délibération n° 2022-100) pour un mot de
 * passe seul : 12 caractères minimum, avec majuscules, minuscules, chiffres
 * et caractères spéciaux. Les identifiants sont ceux attendus dans
 * `failedRules` : à faire valider par le back.
 */

/** Règle affichée par `PasswordField` ; `met` vient du contrôle local ou de `failedRules` (422). */
export type PasswordRule = {
  id: string;
  label: string;
  met: boolean;
};

export const PASSWORD_MIN_LENGTH = 12;

export const PASSWORD_RULE_IDS = [
  "min_length",
  "uppercase",
  "lowercase",
  "digit",
  "special",
] as const;

export type PasswordRuleId = (typeof PASSWORD_RULE_IDS)[number];

type RuleDefinition = {
  id: PasswordRuleId;
  label: string;
  test: (value: string) => boolean;
};

const definitions: readonly RuleDefinition[] = [
  {
    id: "min_length",
    label: `${PASSWORD_MIN_LENGTH} caractères minimum`,
    // Compte les caractères affichés (un emoji = 1), pas les unités UTF-16.
    test: (value) => Array.from(value).length >= PASSWORD_MIN_LENGTH,
  },
  {
    id: "uppercase",
    label: "Au moins une majuscule",
    test: (value) => /\p{Lu}/u.test(value),
  },
  {
    id: "lowercase",
    label: "Au moins une minuscule",
    test: (value) => /\p{Ll}/u.test(value),
  },
  {
    id: "digit",
    label: "Au moins un chiffre",
    test: (value) => /\p{Nd}/u.test(value),
  },
  {
    id: "special",
    label: "Au moins un caractère spécial (ex. : ! ? @ # - _)",
    // Tout ce qui n'est ni lettre, ni chiffre, ni espace.
    test: (value) => /[^\p{L}\p{Nd}\s]/u.test(value),
  },
];

/** Règles évaluées localement pendant la saisie, pour `PasswordField`. */
export function evaluatePasswordRules(value: string): PasswordRule[] {
  return definitions.map(({ id, label, test }) => ({
    id,
    label,
    met: test(value),
  }));
}

/** `true` si toutes les règles locales sont respectées. */
export function isPasswordValid(value: string): boolean {
  return definitions.every(({ test }) => test(value));
}

/**
 * Applique la réponse 422 du serveur : une règle citée dans `failedRules`
 * est non respectée, même si le contrôle local la croyait respectée (le
 * serveur fait foi). Comparaison sans tenir compte de la casse ; un
 * identifiant inconnu est ignoré.
 */
export function applyFailedRules(
  rules: PasswordRule[],
  failedRules: readonly string[] | undefined,
): PasswordRule[] {
  if (!failedRules || failedRules.length === 0) return rules;
  const failed = new Set(failedRules.map((rule) => rule.toLowerCase()));
  return rules.map((rule) =>
    failed.has(rule.id.toLowerCase()) ? { ...rule, met: false } : rule,
  );
}
