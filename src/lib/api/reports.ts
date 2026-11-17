import type { operations } from "@/types/api";
import type { Decision, ReportDraft, Section } from "@/types/domain";

type JsonBody<T> = T extends { content: { "application/json": infer B } }
  ? B
  : never;

/** POST /reports/drafts/{reportId}/sections (createManualReportSection). */
export type CreateSectionInput = JsonBody<
  operations["createManualReportSection"]["requestBody"]
>;
export type CreateSectionResult = JsonBody<
  operations["createManualReportSection"]["responses"][201]
>;

/**
 * Client Rapports, aligné sur le contrat OpenAPI :
 * - getDraft : GET /reports/drafts/{reportId} → 200 ReportDraft ; 403, 404.
 * - createSection : POST /reports/drafts/{reportId}/sections, Idempotency-Key
 *   → 201 { sectionId } ; 403, 404, 409, 422.
 * - updateSection : PATCH /reports/drafts/{reportId}/sections/{sectionId}
 *   → 200 ReportSection ; 403, 409, 422.
 * Le back n'implémente pas encore ces routes : seul le mock existe.
 */
export interface ReportsApi {
  /** Permet d'afficher à l'écran si les données viennent du mock ou du back réel. */
  readonly kind: "mock" | "http";
  getDraft(reportId: string): Promise<ReportDraft>;
  createSection(
    reportId: string,
    input: CreateSectionInput,
    idempotencyKey: string,
  ): Promise<CreateSectionResult>;
  updateSection(
    reportId: string,
    sectionId: string,
    input: Decision,
  ): Promise<Section>;
}
