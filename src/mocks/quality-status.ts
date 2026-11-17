import type { IndicatorValue, QualityStatus } from "@/types/domain";
import { QUALITY_STATUSES } from "@/types/domain";

const base = {
  indicatorId: "price-m2",
  level: "municipality" as const,
  placeId: "59230",
  year: 2024,
  sourceId: "source-dvf",
};

export const mockIndicatorValuesByQuality = {
  available: {
    ...base,
    value: 1980,
    status: "available",
    sampleSize: 612,
    classId: "price-mid",
  },
  missing: {
    ...base,
    placeId: "59253",
    value: null,
    status: "missing",
    sampleSize: null,
    classId: null,
  },
  insufficient_sample: {
    ...base,
    placeId: "59252",
    value: null,
    status: "insufficient_sample",
    sampleSize: 3,
    classId: null,
  },
  suppressed: {
    ...base,
    placeId: "59257",
    value: null,
    status: "suppressed",
    sampleSize: 8,
    classId: null,
  },
  source_error: {
    ...base,
    placeId: "59261",
    value: null,
    status: "source_error",
    sampleSize: null,
    classId: null,
  },
  not_computable: {
    ...base,
    placeId: "59265",
    value: null,
    status: "not_computable",
    sampleSize: null,
    classId: null,
  },
} as const satisfies Record<QualityStatus, IndicatorValue>;

export const mockIndicatorValues: IndicatorValue[] = QUALITY_STATUSES.map(
  (status) => mockIndicatorValuesByQuality[status],
);
