import type { Decision, ReportDraft, Section } from "@/types/domain";

/*
 * EN ATTENTE DU CONTRAT 1.1.0 — création manuelle (US-026). Suivi : voir #17.
 * Ces types reprennent à l'identique `createManualReportSection` et
 * `ReportSection.type = "manual"` de la PR back #35, fusionnée sur `main`
 * du back mais absente du contrat de référence front (v1.0.0).
 * Quand le contrat 1.1.0 sera publié : `npm run generate:api`, puis
 * remplacer ces types par ceux de `@/types/api` et `@/types/domain`.
 */

/** maxLength du titre dans createManualReportSection (PR back #35). */
export const SECTION_TITLE_MAX_LENGTH = 200;

/** Corps de POST /reports/drafts/{reportId}/sections. */
export type CreateSectionInput = {
  /** 1 à 200 caractères. */
  title: string;
  /** Au moins 1 caractère, Markdown. */
  text: string;
};

/** Réponse 201 de POST /reports/drafts/{reportId}/sections. */
export type CreateSectionResult = {
  /** Format: uuid */
  sectionId: string;
};

/** `ReportSection.type`, complété de `manual`. */
export type ReportSectionType = NonNullable<Section["type"]> | "manual";

export type ReportSectionWithManual = Omit<Section, "type"> & {
  type?: ReportSectionType;
};

export type ReportDraftWithManual = Omit<ReportDraft, "sections"> & {
  sections?: ReportSectionWithManual[];
};

/**
 * Client Rapports :
 * - getDraft : GET /reports/drafts/{reportId} → 200 ReportDraft ; 403, 404 (v1.0.0).
 * - createSection : POST /reports/drafts/{reportId}/sections, Idempotency-Key
 *   → 201 { sectionId } ; 403, 404, 409, 422 (contrat 1.1.0 en attente).
 * - updateSection : PATCH /reports/drafts/{reportId}/sections/{sectionId}
 *   → 200 ReportSection ; 403, 409, 422 (v1.0.0).
 * Le back n'implémente pas encore ces routes : seul le mock existe.
 */
export interface ReportsApi {
  /** Permet d'afficher à l'écran si les données viennent du mock ou du back réel. */
  readonly kind: "mock" | "http";
  getDraft(reportId: string): Promise<ReportDraftWithManual>;
  createSection(
    reportId: string,
    input: CreateSectionInput,
    idempotencyKey: string,
  ): Promise<CreateSectionResult>;
  updateSection(
    reportId: string,
    sectionId: string,
    input: Decision,
  ): Promise<ReportSectionWithManual>;
}
