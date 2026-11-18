import type { components, operations } from "@/types/api";

export type ExplorerQuery = operations["getExplorer"]["parameters"]["query"];
export type ExplorerResponse = operations["getExplorer"]["responses"][200]["content"]["application/json"];
export type ApiMunicipality = components["schemas"]["Municipality"];
export type ApiIndicatorValue = components["schemas"]["IndicatorValue"];
export type ApiValueClass = components["schemas"]["ValueClass"];
export type ApiError = components["schemas"]["ApiError"];
export type ApiUser = components["schemas"]["User"];

/** Point de remplacement du mock par le futur client HTTP ; aucun endpoint local. */
export type ExplorerDataSource = (query: ExplorerQuery, options: { signal: AbortSignal }) => Promise<ExplorerResponse>;
