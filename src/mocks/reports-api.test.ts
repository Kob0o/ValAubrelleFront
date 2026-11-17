import { describe, expect, it } from "vitest";

import { mockReportDraft } from "@/mocks/report-draft";
import { createMockReportsApi } from "@/mocks/reports-api";

const id = mockReportDraft.id;
const firstSection = mockReportDraft.sections[0];

describe("createMockReportsApi", () => {
  it("se déclare comme mock", () => {
    expect(createMockReportsApi().kind).toBe("mock");
  });

  it("ne crée pas de doublon pour une même Idempotency-Key", async () => {
    const api = createMockReportsApi();
    const input = { title: "T", text: "X" };
    const first = await api.createSection(id, input, "key-1");
    const second = await api.createSection(id, input, "key-1");
    expect(second).toEqual(first);
    const draft = await api.getDraft(id);
    expect(draft.sections).toHaveLength(mockReportDraft.sections.length + 1);
  });

  it("renvoie une ApiError 422 rattachée aux champs", async () => {
    const api = createMockReportsApi();
    await expect(
      api.createSection(id, { title: " ", text: "" }, "k"),
    ).rejects.toMatchObject({
      httpStatus: 422,
      code: "VALIDATION_FAILED",
      fields: { title: expect.any(String), text: expect.any(String) },
    });
  });

  it("refuse un titre de plus de 200 caractères (maxLength du contrat)", async () => {
    const api = createMockReportsApi();
    await expect(
      api.createSection(id, { title: "a".repeat(201), text: "X" }, "k"),
    ).rejects.toMatchObject({ httpStatus: 422, fields: { title: expect.any(String) } });
  });

  it("renvoie 409 VERSION_CONFLICT si la version a changé", async () => {
    const api = createMockReportsApi();
    await expect(
      api.updateSection(id, firstSection.id, { status: "accepted", version: 1 }),
    ).rejects.toMatchObject({
      httpStatus: 409,
      code: "VERSION_CONFLICT",
      details: { current: { version: firstSection.version } },
    });
  });

  it("renvoie la section mise à jour (200 ReportSection)", async () => {
    const api = createMockReportsApi();
    const updated = await api.updateSection(id, firstSection.id, {
      status: "edited",
      editedText: "Nouveau texte",
      version: firstSection.version,
    });
    expect(updated).toMatchObject({
      id: firstSection.id,
      status: "edited",
      text: "Nouveau texte",
      version: firstSection.version + 1,
    });
  });

  it("ne modifie pas la fixture partagée", async () => {
    const api = createMockReportsApi();
    await api.createSection(id, { title: "T", text: "X" }, "k");
    expect(mockReportDraft.sections).toHaveLength(5);
  });
});
