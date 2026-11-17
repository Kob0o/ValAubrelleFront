import { describe, expect, it } from "vitest";

import { compareIndicatorValues } from "@/lib/compare-indicator-values";
import type { IndicatorValue } from "@/types/domain";

type Entry = Pick<IndicatorValue, "value" | "status">;

const entries: Entry[] = [
  { value: null, status: "suppressed" },
  { value: 2100, status: "available" },
  { value: null, status: "missing" },
  { value: 1500, status: "available" },
  { value: null, status: "available" },
  { value: 0, status: "available" },
];

function sortedValues(direction: "asc" | "desc") {
  return [...entries]
    .sort((left, right) => compareIndicatorValues(left, right, direction))
    .map((entry) => entry.value);
}

describe("compareIndicatorValues", () => {
  it("trie en croissant et range les valeurs absentes en fin", () => {
    expect(sortedValues("asc")).toEqual([0, 1500, 2100, null, null, null]);
  });

  it("trie en décroissant et range toujours les valeurs absentes en fin", () => {
    expect(sortedValues("desc")).toEqual([2100, 1500, 0, null, null, null]);
  });

  it("trie en croissant par défaut", () => {
    expect(
      compareIndicatorValues(
        { value: 1, status: "available" },
        { value: 2, status: "available" },
      ),
    ).toBeLessThan(0);
  });
});
