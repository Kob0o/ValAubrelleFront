import type { User } from "@/types/domain";

/** Utilisateur de démo (fixtures #5) pour le mode mock du client API. */
export const mockUser = {
  id: "5f0c8a52-2f5e-4c1b-9d43-0e9f0b1a7c11",
  name: "Camille Martin",
  email: "maire@val-aubrelle.example",
  role: "mayor",
  municipalityCodes: ["59230", "59231"],
} as const satisfies User;

/** Mot de passe accepté uniquement en mode mock (aucune valeur secrète de prod). */
export const MOCK_PASSWORD = "motdepasse";
