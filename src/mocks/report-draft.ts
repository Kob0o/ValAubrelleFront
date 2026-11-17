import type { CreateSectionInput } from "@/lib/api/reports";
import type { ReportDraft } from "@/types/domain";

/** Brouillon fictif : une section par statut, plus une deuxième « à revoir ». */
export const mockReportDraft = {
  id: "7d0f3a52-1c4e-4b8a-9f61-2a5d8e0c4b11",
  title: "Diagnostic habitat — OPAH Val d'Aubrelle 2026 (fictif)",
  sections: [
    {
      id: "0b6e2f8c-3a1d-4e57-8c90-1f2a3b4c5d01",
      order: 1,
      title: "Contexte du territoire",
      type: "generated",
      text: "Le territoire compte **32 communes** et environ 68 000 habitants.",
      sources: [
        {
          id: "5f1a2b3c-4d5e-4f60-8172-839a4b5c6d01",
          label: "Recensement de la population",
          publisher: "INSEE",
          vintage: 2022,
          extractedAt: "2025-01-10",
        },
      ],
      status: "accepted",
      version: 3,
    },
    {
      id: "0b6e2f8c-3a1d-4e57-8c90-1f2a3b4c5d02",
      order: 2,
      title: "Parc de logements vacants",
      type: "generated",
      text: "Le taux de vacance atteint 9,4 % dans les centres-bourgs.",
      sources: [],
      status: "to_review",
      version: 1,
    },
    {
      id: "0b6e2f8c-3a1d-4e57-8c90-1f2a3b4c5d03",
      order: 3,
      title: "Bilan de l'OPAH précédente",
      type: "opah_review",
      text: "142 logements rénovés entre 2021 et 2025.",
      sources: [],
      status: "edited",
      version: 2,
    },
    {
      id: "0b6e2f8c-3a1d-4e57-8c90-1f2a3b4c5d04",
      order: 4,
      title: "Foncier mobilisable",
      type: "land",
      text: "Analyse des dents creuses en cours.",
      sources: [],
      status: "to_review",
      version: 1,
    },
    {
      id: "0b6e2f8c-3a1d-4e57-8c90-1f2a3b4c5d05",
      order: 5,
      title: "Annexe technique",
      type: "generated",
      text: "Méthodologie détaillée.",
      sources: [],
      status: "excluded",
      version: 1,
    },
  ],
} satisfies ReportDraft;

/** Saisie manuelle type, pour les tests de création. */
export const mockManualSectionInput = {
  title: "Orientations pour la prochaine OPAH",
  text: "## Priorités\n\n- Lutte contre la vacance\n- Rénovation énergétique",
} satisfies CreateSectionInput;
