import type { ExplorerYear } from "@/types/domain";

/**
 * Années fictives au format de GET /explorer (`years`), dans l'ordre
 * croissant comme une réponse d'API : YearPicker les trie lui-même.
 * 2018 et 2021 n'ont pas de donnée (ex. : source non millésimée).
 */
export const mockExplorerYears = [
  { year: 2018, hasData: false },
  { year: 2019, hasData: true },
  { year: 2020, hasData: true },
  { year: 2021, hasData: false },
  { year: 2022, hasData: true },
  { year: 2023, hasData: true },
  { year: 2024, hasData: true },
] satisfies ExplorerYear[];
