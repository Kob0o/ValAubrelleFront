import { afterEach, describe, expect, it } from "vitest";

import {
  clearSessionUser,
  readSessionUser,
  writeSessionUser,
} from "@/lib/auth/session-source";
import { mockUser } from "@/mocks/auth";

afterEach(() => {
  clearSessionUser();
});

describe("session-source", () => {
  it("écrit et relit un utilisateur valide", () => {
    writeSessionUser(mockUser);
    expect(readSessionUser()).toEqual(mockUser);
  });

  it("ignore un payload invalide ou corrompu", () => {
    window.sessionStorage.setItem("va.auth.user", "{not-json");
    expect(readSessionUser()).toBeNull();

    window.sessionStorage.setItem(
      "va.auth.user",
      JSON.stringify({ email: "x@y.z" }),
    );
    expect(readSessionUser()).toBeNull();
  });

  it("clearSessionUser vide le stockage", () => {
    writeSessionUser(mockUser);
    clearSessionUser();
    expect(readSessionUser()).toBeNull();
  });
});
