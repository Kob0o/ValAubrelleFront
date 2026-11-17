import { describe, expect, it } from "vitest";

import { getFieldError } from "@/components/forms/field-error";

describe("getFieldError", () => {
  const apiError = {
    code: "VALIDATION_FAILED",
    message: "Champs invalides",
    fields: { email: "Adresse invalide", name: "" },
  };

  it("renvoie la raison du champ sur un 422", () => {
    expect(getFieldError(apiError, "email")).toBe("Adresse invalide");
  });

  it("renvoie undefined sans erreur, sans fields ou pour un autre champ", () => {
    expect(getFieldError(null, "email")).toBeUndefined();
    expect(getFieldError(undefined, "email")).toBeUndefined();
    expect(getFieldError({}, "email")).toBeUndefined();
    expect(getFieldError(apiError, "password")).toBeUndefined();
    expect(getFieldError(apiError, "name")).toBeUndefined();
  });
});
