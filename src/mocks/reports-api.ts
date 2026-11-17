import { buildApiError } from "@/lib/api/errors";
import { SECTION_TITLE_MAX_LENGTH, type ReportsApi } from "@/lib/api/reports";
import { mockReportDraft } from "@/mocks/report-draft";
import type { ReportDraft } from "@/types/domain";


type MockOptions = {
  initial?: ReportDraft;
  /** Latence simulée en ms (0 dans les tests). */
  latency?: number;
};

/**
 * Client Rapports en mémoire, conforme au contrat OpenAPI (routes, corps,
 * codes d'erreur). Remplacé par un client HTTP quand le back sera implémenté.
 */
export function createMockReportsApi({
  initial = mockReportDraft,
  latency = 0,
}: MockOptions = {}): ReportsApi {
  const draft: ReportDraft = structuredClone(initial);
  const sections = (draft.sections ??= []);
  const idempotency = new Map<string, string>();

  const wait = () =>
    latency > 0
      ? new Promise((resolve) => setTimeout(resolve, latency))
      : Promise.resolve();

  function assertDraft(reportId: string) {
    if (reportId !== draft.id) throw buildApiError({ httpStatus: 404, body: { code: "NOT_FOUND" } });
  }

  return {
    kind: "mock",

    async getDraft(reportId) {
      await wait();
      assertDraft(reportId);
      return structuredClone(draft);
    },

    async createSection(reportId, input, idempotencyKey) {
      await wait();
      assertDraft(reportId);
      const known = idempotency.get(idempotencyKey);
      if (known) return { sectionId: known };

      const fields: Record<string, string> = {};
      if (!input.title.trim()) fields.title = "Le titre est obligatoire.";
      else if (input.title.length > SECTION_TITLE_MAX_LENGTH)
        fields.title = `Le titre ne doit pas dépasser ${SECTION_TITLE_MAX_LENGTH} caractères.`;
      if (!input.text.trim()) fields.text = "Le texte est obligatoire.";
      if (Object.keys(fields).length > 0) {
        throw buildApiError({
          httpStatus: 422,
          body: { code: "VALIDATION_FAILED", fields },
        });
      }

      const sectionId = globalThis.crypto.randomUUID();
      sections.push({
        id: sectionId,
        order: Math.max(0, ...sections.map((s) => s.order ?? 0)) + 1,
        title: input.title.trim(),
        type: "manual",
        text: input.text,
        sources: [],
        status: "to_review",
        version: 1,
      });
      idempotency.set(idempotencyKey, sectionId);
      return { sectionId };
    },

    async updateSection(reportId, sectionId, input) {
      await wait();
      assertDraft(reportId);
      const section = sections.find((s) => s.id === sectionId);
      if (!section) throw buildApiError({ httpStatus: 404, body: { code: "NOT_FOUND" } });
      if (section.version !== input.version) {
        throw buildApiError({
          httpStatus: 409,
          body: {
            code: "VERSION_CONFLICT",
            details: { current: { version: section.version } },
          },
        });
      }
      section.status = input.status;
      if (input.editedText !== undefined) section.text = input.editedText;
      section.version = (section.version ?? 0) + 1;
      return structuredClone(section);
    },
  };
}
