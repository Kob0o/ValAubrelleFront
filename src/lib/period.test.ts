import { describe, expect, it } from "vitest";

import {
  isYearAvailable,
  periodErrorMessage,
  toDateRangeQuery,
  toYearRangeQuery,
  validatePeriod,
} from "@/lib/period";
import { mockExplorerYears as years } from "@/mocks";

describe("validatePeriod", () => {
  it("accepte une période valide", () => {
    expect(validatePeriod({ start: 2019, end: 2024 }, { years })).toEqual({
      ok: true,
      period: { start: 2019, end: 2024 },
    });
  });

  it("accepte une année unique par défaut", () => {
    expect(validatePeriod({ start: 2022, end: 2022 }, { years }).ok).toBe(true);
  });

  it("refuse l'année unique quand allowSingleYear est faux", () => {
    expect(
      validatePeriod({ start: 2022, end: 2022 }, { years, allowSingleYear: false }),
    ).toEqual({ ok: false, code: "SINGLE_YEAR", bound: "both" });
  });

  it("signale des bornes inversées sans les permuter", () => {
    expect(validatePeriod({ start: 2024, end: 2019 }, { years })).toEqual({
      ok: false,
      code: "INVERTED",
      bound: "both",
    });
  });

  it.each([
    [{ start: undefined, end: 2024 }, "start"],
    [{ start: 2019, end: undefined }, "end"],
    [{ start: undefined, end: undefined }, "both"],
  ] as const)("signale une borne manquante (%o)", (input, bound) => {
    expect(validatePeriod(input, { years })).toEqual({
      ok: false,
      code: "MISSING_BOUND",
      bound,
    });
  });

  it.each([
    [{ start: 2021, end: 2023 }, "start"],
    [{ start: 2019, end: 2021 }, "end"],
    [{ start: 2018, end: 2021 }, "both"],
    [{ start: 2015, end: 2024 }, "start"],
  ] as const)("signale une année sans donnée ou absente (%o)", (input, bound) => {
    expect(validatePeriod(input, { years })).toEqual({ ok: false, code: "NO_DATA", bound });
  });

  it("vérifie la borne manquante avant l'ordre et les données", () => {
    expect(validatePeriod({ start: 2021, end: undefined }, { years })).toMatchObject({
      ok: false,
      code: "MISSING_BOUND",
    });
  });

  it("ne vérifie pas les données sans liste d'années", () => {
    expect(validatePeriod({ start: 2015, end: 2016 }).ok).toBe(true);
  });
});

describe("isYearAvailable", () => {
  it("exige une année présente et avec données", () => {
    expect(isYearAvailable(years, 2024)).toBe(true);
    expect(isYearAvailable(years, 2021)).toBe(false);
    expect(isYearAvailable(years, 2015)).toBe(false);
  });
});

describe("conversions vers les paramètres d'API", () => {
  it("donne startYear / endYear pour GET /explorer", () => {
    expect(toYearRangeQuery({ start: 2019, end: 2024 })).toEqual({
      startYear: 2019,
      endYear: 2024,
    });
  });

  it("donne des dates du 1er janvier au 31 décembre pour l'analyse", () => {
    expect(toDateRangeQuery({ start: 2019, end: 2024 })).toEqual({
      start: "2019-01-01",
      end: "2024-12-31",
    });
  });
});

describe("periodErrorMessage", () => {
  it("rédige le message d'inversion demandé par le ticket", () => {
    const input = { start: 2024, end: 2019 };
    const validation = validatePeriod(input, { years });
    if (validation.ok) throw new Error("période attendue invalide");
    expect(periodErrorMessage(validation, input)).toBe(
      "L’année de début doit être antérieure ou égale à l’année de fin.",
    );
  });

  it("nomme l'année sans donnée", () => {
    const input = { start: 2021, end: 2023 };
    const validation = validatePeriod(input, { years });
    if (validation.ok) throw new Error("période attendue invalide");
    expect(periodErrorMessage(validation, input)).toBe(
      "Aucune donnée n’est disponible pour 2021. Choisissez une autre année.",
    );
  });
});
