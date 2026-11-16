import type { Source } from "@/types/domain";

export const mockSources = [
  {
    id: "source-dvf",
    producer: "DGFiP",
    dataset: "Demandes de valeurs foncières",
    startYear: 2019,
    endYear: 2024,
    importDate: "2025-01-15",
    transformation: "Agrégation communale des ventes hors dépendances",
  },
  {
    id: "source-dpe",
    producer: "ADEME",
    dataset: "Observatoire DPE",
    startYear: 2021,
    endYear: 2024,
    importDate: "2025-02-03",
    transformation: "Répartition des étiquettes A–G par commune",
  },
  {
    id: "source-georisques",
    producer: "BRGM / Géorisques",
    dataset: "Exposition aux risques naturels",
    startYear: 2020,
    endYear: 2024,
    importDate: "2025-01-28",
    transformation: "Niveau d'aléa dominant par commune",
  },
] as const satisfies readonly Source[];
