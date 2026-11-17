/**
 * Fixtures de communes pour les tests du lot G0 (DataTable et listes).
 * Source : src/mocks/ — à remplacer par les types générés du contrat
 * d'API (G0.B) et les vraies données une fois le back branché.
 *
 * Les valeurs `null` sont volontaires : une donnée manquante ne doit
 * jamais être affichée comme un 0 (rendu délégué à QualityValue plus tard).
 */
export interface MunicipalityFixture {
  id: string;
  name: string;
  inseeCode: string;
  /** `null` = population non renseignée, à distinguer d'un vrai 0. */
  population: number | null;
  /** `null` = score non calculé. */
  qualityScore: number | null;
  openRequests: number;
}

export const municipalities: MunicipalityFixture[] = [
  {
    id: "aubrelle",
    name: "Aubrelle",
    inseeCode: "01001",
    population: 12480,
    qualityScore: 92,
    openRequests: 3,
  },
  {
    id: "valmont-sur-lys",
    name: "Valmont-sur-Lys",
    inseeCode: "01002",
    population: 8150,
    qualityScore: null,
    openRequests: 1,
  },
  {
    id: "brumecourt",
    name: "Brumecourt",
    inseeCode: "01003",
    population: null,
    qualityScore: 74,
    openRequests: 0,
  },
  {
    id: "la-clairiere",
    name: "La Clairière",
    inseeCode: "01004",
    population: 3270,
    qualityScore: 88,
    openRequests: 5,
  },
  {
    id: "rochefort-en-brume",
    name: "Rochefort-en-Brume",
    inseeCode: "01005",
    population: 5640,
    qualityScore: null,
    openRequests: 2,
  },
  {
    id: "pre-saint-martin",
    name: "Pré-Saint-Martin",
    inseeCode: "01006",
    population: 1930,
    qualityScore: 81,
    openRequests: 0,
  },
];

/** Réponse paginée type `Page` du contrat d'API (inventaire B1). */
export const municipalityPageFixture = {
  items: municipalities,
  page: 1,
  size: 20,
  total: municipalities.length,
  sort: "name,asc",
} as const;
