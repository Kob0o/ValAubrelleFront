import { describe, expect, it } from "vitest";

import {
  PASSWORD_RULE_IDS,
  applyFailedRules,
  evaluatePasswordRules,
  isPasswordValid,
} from "@/lib/auth/password-rules";

const metById = (value: string) =>
  Object.fromEntries(evaluatePasswordRules(value).map((rule) => [rule.id, rule.met]));

describe("règles de mot de passe (CNIL)", () => {
  it("expose les 5 règles dans l'ordre d'affichage", () => {
    expect(evaluatePasswordRules("").map((rule) => rule.id)).toEqual([
      ...PASSWORD_RULE_IDS,
    ]);
  });

  it("un mot de passe vide ne respecte aucune règle", () => {
    expect(Object.values(metById(""))).toEqual([false, false, false, false, false]);
    expect(isPasswordValid("")).toBe(false);
  });

  it("valide un mot de passe conforme", () => {
    expect(isPasswordValid("Aubrelle-2026")).toBe(true);
  });

  it.each([
    ["Aub-2026", "min_length"],
    ["aubrelle-2026", "uppercase"],
    ["AUBRELLE-2026", "lowercase"],
    ["Aubrelle-deux", "digit"],
    ["Aubrelle2026x", "special"],
  ])("%s échoue seulement sur %s", (value, failing) => {
    const result = metById(value);
    expect(result[failing]).toBe(false);
    for (const id of PASSWORD_RULE_IDS.filter((rule) => rule !== failing)) {
      expect(result[id]).toBe(true);
    }
  });

  it("accepte les lettres accentuées", () => {
    expect(metById("élève-ÉCOLE-1")).toMatchObject({ uppercase: true, lowercase: true });
  });

  it("ne compte pas l'espace comme caractère spécial", () => {
    expect(metById("Aubrelle 2026 x").special).toBe(false);
  });

  it("compte un emoji comme un seul caractère", () => {
    // 4 caractères + n emojis (2 unités UTF-16 chacun).
    const withEmojis = (count: number) => "Aa1-" + "\u{1F600}".repeat(count);
    expect(withEmojis(8).length).toBe(20);
    expect(metById(withEmojis(8)).min_length).toBe(true); // 12 caractères
    expect(metById(withEmojis(7)).min_length).toBe(false); // 11 caractères
  });
});

describe("applyFailedRules", () => {
  it("marque non respectées les règles citées par le serveur", () => {
    const rules = applyFailedRules(evaluatePasswordRules("Aubrelle-2026"), [
      "SPECIAL",
      "inconnue",
    ]);
    expect(rules.find((rule) => rule.id === "special")?.met).toBe(false);
    expect(rules.filter((rule) => !rule.met)).toHaveLength(1);
  });

  it("ne change rien sans failedRules", () => {
    const rules = evaluatePasswordRules("Aubrelle-2026");
    expect(applyFailedRules(rules, undefined)).toBe(rules);
    expect(applyFailedRules(rules, [])).toBe(rules);
  });
});
