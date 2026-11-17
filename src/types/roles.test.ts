import { describe, expect, it } from "vitest";

import {
  ROLES,
  roleLabels,
  toAuthorRole,
  type AuthorRole,
  type Role,
} from "@/types/roles";

const expectedMapping: Record<Role, AuthorRole> = {
  mayor: "mayor",
  community_councillor: "elected",
  housing_officer: "housing",
  admin: "ops",
};

describe("toAuthorRole", () => {
  it.each(ROLES)("mappe %s vers le AuthorRole attendu", (role) => {
    expect(toAuthorRole(role)).toBe(expectedMapping[role]);
  });
});

describe("roleLabels", () => {
  it.each(ROLES)("fournit un libellé français pour %s", (role) => {
    expect(roleLabels[role].length).toBeGreaterThan(0);
  });

  it("fournit un libellé pour visitor", () => {
    expect(roleLabels.visitor).toBe("Visiteur");
  });
});
