import { describe, expect, it } from "vitest";

import { statusVisuals } from "@/components/shared/status-badge.config";
import {
  countByStatus,
  formatStatusCount,
  sectionStatusDotClass,
} from "@/lib/reports/section-status";
import { mockReportDraft } from "@/mocks/report-draft";
import { SECTION_STATUSES } from "@/types/domain";

describe("section-status", () => {
  it("compte les sections par statut", () => {
    expect(countByStatus(mockReportDraft.sections)).toEqual({
      to_review: 2,
      accepted: 1,
      edited: 1,
      excluded: 1,
    });
    expect(countByStatus([])).toEqual({
      to_review: 0,
      accepted: 0,
      edited: 0,
      excluded: 0,
    });
  });

  it("formate les compteurs en texte lisible", () => {
    expect(formatStatusCount("to_review", 3)).toBe("3 à revoir");
    expect(formatStatusCount("accepted", 1)).toBe("1 acceptée");
    expect(formatStatusCount("accepted", 2)).toBe("2 acceptées");
    expect(formatStatusCount("excluded", 0)).toBe("0 exclue");
  });

  it("colore la pastille du compteur comme le StatusBadge de la section", () => {
    const toneVar = {
      neutral: "--color-text-muted",
      info: "--color-info",
      success: "--color-success",
      warning: "--color-warning",
      danger: "--color-danger",
    } as const;
    for (const status of SECTION_STATUSES) {
      const tone = statusVisuals.section[status].tone;
      expect(sectionStatusDotClass(status)).toContain(toneVar[tone]);
    }
  });
});
