import type { components } from "@/types/api";

type Schemas = components["schemas"];

export type Role = Schemas["Role"];
export type Mandate = Schemas["Mandate"];
export type HousingRole = Schemas["HousingRole"];
export type AuthorRole = Schemas["Author"]["role"];

export type AppRole = Role | "visitor";

export const ROLES = [
  "mayor",
  "community_councillor",
  "housing_officer",
  "admin",
] as const satisfies readonly Role[];

export const APP_ROLES = [
  ...ROLES,
  "visitor",
] as const satisfies readonly AppRole[];

export const roleLabels = {
  mayor: "Maire",
  community_councillor: "Élu communautaire",
  housing_officer: "Agent Habitat",
  admin: "Administrateur",
  visitor: "Visiteur",
} satisfies Record<AppRole, string>;

export const authorRoleLabels = {
  mayor: "Maire",
  elected: "Élu",
  housing: "Habitat",
  ops: "Exploitation",
} satisfies Record<AuthorRole, string>;

const AUTHOR_ROLE_BY_ROLE: Record<Role, AuthorRole> = {
  mayor: "mayor",
  community_councillor: "elected",
  housing_officer: "housing",
  admin: "ops",
};

export function toAuthorRole(role: Role): AuthorRole {
  return AUTHOR_ROLE_BY_ROLE[role];
}
