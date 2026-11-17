import { describe, expect, it } from "vitest";

import {
  ACCOUNT_STATUSES,
  FRESHNESS_STATUSES,
  INSEE_CODE_PATTERN,
  QUALITY_STATUSES,
  REPORT_DISPLAY_STATUSES,
  REQUEST_STATUSES,
  SECTION_STATUSES,
  statusLabels,
  type IndicatorValue,
} from "@/types/domain";
import { mockIndicatorValuesByQuality } from "@/mocks/quality-status";
import { mockMunicipalities } from "@/mocks/municipalities";

describe("statusLabels", () => {
  it.each(QUALITY_STATUSES)("qualité %s a un libellé français", (status) => {
    expect(statusLabels.quality[status].length).toBeGreaterThan(0);
  });

  it.each(REQUEST_STATUSES)("demande %s a un libellé français", (status) => {
    expect(statusLabels.request[status].length).toBeGreaterThan(0);
  });

  it.each(REPORT_DISPLAY_STATUSES)(
    "rapport %s a un libellé français",
    (status) => {
      expect(statusLabels.report[status].length).toBeGreaterThan(0);
    },
  );

  it.each(FRESHNESS_STATUSES)(
    "fraîcheur %s a un libellé français",
    (status) => {
      expect(statusLabels.freshness[status].length).toBeGreaterThan(0);
    },
  );

  it.each(ACCOUNT_STATUSES)("compte %s a un libellé français", (status) => {
    expect(statusLabels.account[status].length).toBeGreaterThan(0);
  });

  it.each(SECTION_STATUSES)("section %s a un libellé français", (status) => {
    expect(statusLabels.section[status].length).toBeGreaterThan(0);
  });
});

describe("IndicatorValue", () => {
  it("accepte null sans le confondre avec 0", () => {
    const missing: IndicatorValue = mockIndicatorValuesByQuality.missing;
    const available: IndicatorValue = mockIndicatorValuesByQuality.available;

    expect(missing.value).toBeNull();
    expect(missing.value).not.toBe(0);
    expect(available.value).toBe(1980);
  });

  it("couvre les six QualityStatus", () => {
    expect(Object.keys(mockIndicatorValuesByQuality)).toEqual([
      ...QUALITY_STATUSES,
    ]);
  });
});

describe("communes fictives", () => {
  it("fournit 32 communes aux codes INSEE valides", () => {
    expect(mockMunicipalities).toHaveLength(32);

    const codes = mockMunicipalities.map((municipality) => municipality.code);
    expect(new Set(codes).size).toBe(32);

    for (const municipality of mockMunicipalities) {
      expect(municipality.code).toMatch(INSEE_CODE_PATTERN);
      expect(municipality.name.length).toBeGreaterThan(0);
    }
  });
});
