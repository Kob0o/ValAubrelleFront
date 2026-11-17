import { act, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { SectionEditor } from "@/components/reports/section-editor";
import { buildApiError } from "@/lib/api/errors";
import { mockManualSectionInput, mockReportDraft } from "@/mocks/report-draft";
import { createMockReportsApi } from "@/mocks/reports-api";

const draftId = mockReportDraft.id;

function fill(title: string, text: string) {
  fireEvent.change(screen.getByLabelText("Titre de la section"), {
    target: { value: title },
  });
  fireEvent.change(screen.getByLabelText("Texte"), {
    target: { value: text },
  });
}

function deferred<T = void>() {
  let resolve!: (value: T) => void;
  let reject!: (reason: unknown) => void;
  const promise = new Promise<T>((res, rej) => {
    resolve = res;
    reject = rej;
  });
  return { promise, resolve, reject };
}

describe("SectionEditor — création", () => {
  it("crée une section avec un titre et un texte depuis les fixtures", async () => {
    const api = createMockReportsApi();
    const onCreate = vi.fn((input, key: string) =>
      api.createSection(draftId, input, key),
    );
    render(<SectionEditor onCreate={onCreate} />);

    fill(mockManualSectionInput.title, mockManualSectionInput.text);
    fireEvent.click(screen.getByRole("button", { name: "Créer la section" }));

    await waitFor(() =>
      expect(screen.getByRole("status")).toHaveTextContent(
        `Section « ${mockManualSectionInput.title} » créée.`,
      ),
    );
    expect(onCreate).toHaveBeenCalledWith(
      mockManualSectionInput,
      expect.any(String),
    );

    const draft = await api.getDraft(draftId);
    const created = draft.sections?.at(-1);
    expect(created).toMatchObject({
      ...mockManualSectionInput,
      type: "manual",
      status: "to_review",
      order: 6,
    });

    // Formulaire vidé après succès
    expect(screen.getByLabelText("Titre de la section")).toHaveValue("");
  });

  it("valide les champs obligatoires et place le focus sur le premier en erreur", async () => {
    const onCreate = vi.fn();
    render(<SectionEditor onCreate={onCreate} />);

    fireEvent.click(screen.getByRole("button", { name: "Créer la section" }));

    const title = screen.getByLabelText("Titre de la section");
    expect(title).toHaveAttribute("aria-invalid", "true");
    expect(title).toHaveAccessibleDescription(
      expect.stringContaining("Saisissez un titre."),
    );
    expect(title).toHaveFocus();
    expect(screen.getByLabelText("Texte")).toHaveAttribute(
      "aria-invalid",
      "true",
    );
    expect(onCreate).not.toHaveBeenCalled();
  });

  it("conserve la saisie et affiche une alerte en cas d'erreur", async () => {
    const onCreate = vi.fn().mockRejectedValue(buildApiError({
        httpStatus: 500,
        correlationId: "3f2b9c1e-0000-4000-8000-000000000001",
      }));
    render(<SectionEditor onCreate={onCreate} />);

    fill("Titre", "Du texte");
    fireEvent.click(screen.getByRole("button", { name: "Créer la section" }));

    expect(await screen.findByRole("alert")).toHaveTextContent(
      /Votre saisie est conservée/,
    );
    expect(screen.getByRole("alert")).toHaveTextContent(
      "3f2b9c1e-0000-4000-8000-000000000001",
    );
    expect(screen.getByLabelText("Titre de la section")).toHaveValue("Titre");
    expect(screen.getByLabelText("Texte")).toHaveValue("Du texte");
  });

  it("rattache une erreur 422 du serveur au champ concerné", async () => {
    const onCreate = vi.fn().mockRejectedValue(
      buildApiError({
        httpStatus: 422,
        body: { fields: { title: "Ce titre existe déjà dans le rapport." } },
      }),
    );
    render(<SectionEditor onCreate={onCreate} />);
    fill("Titre", "Texte");
    fireEvent.click(screen.getByRole("button", { name: "Créer la section" }));

    await screen.findByRole("alert");
    expect(screen.getByLabelText("Titre de la section")).toHaveAccessibleDescription(
      expect.stringContaining("Ce titre existe déjà dans le rapport."),
    );
  });

  it("réutilise la même Idempotency-Key pour un nouvel essai, en change si la saisie change", async () => {
    const onCreate = vi
      .fn()
      .mockRejectedValueOnce(buildApiError({ httpStatus: 503 }))
      .mockRejectedValueOnce(buildApiError({ httpStatus: 503 }))
      .mockResolvedValue({ sectionId: "x" });
    render(<SectionEditor onCreate={onCreate} />);
    const button = screen.getByRole("button", { name: "Créer la section" });

    fill("Titre", "Texte");
    fireEvent.click(button);
    await screen.findByRole("alert");
    fireEvent.click(button);
    await waitFor(() => expect(onCreate).toHaveBeenCalledTimes(2));
    await screen.findByRole("alert");
    expect(onCreate.mock.calls[1][1]).toBe(onCreate.mock.calls[0][1]);

    fill("Titre", "Texte corrigé");
    fireEvent.click(button);
    await waitFor(() => expect(onCreate).toHaveBeenCalledTimes(3));
    expect(onCreate.mock.calls[2][1]).not.toBe(onCreate.mock.calls[0][1]);
  });

  it("n'envoie qu'une requête en cas de double clic et indique l'enregistrement", async () => {
    const pending = deferred();
    const onCreate = vi.fn(() => pending.promise);
    render(<SectionEditor onCreate={onCreate} />);

    fill("Titre", "Texte");
    const form = screen.getByRole("form", { name: "Nouvelle section" });
    fireEvent.submit(form);
    fireEvent.submit(form);

    const busy = await screen.findByRole("button", { name: "Enregistrement…" });
    expect(busy).toBeDisabled();
    expect(form).toHaveAttribute("aria-busy", "true");
    expect(onCreate).toHaveBeenCalledTimes(1);

    await act(async () => pending.resolve());
    expect(
      await screen.findByRole("button", { name: "Créer la section" }),
    ).toBeEnabled();
  });
});

describe("SectionEditor — édition", () => {
  const section = mockReportDraft.sections[1];

  it("envoie un PATCH avec editedText et version", async () => {
    const api = createMockReportsApi();
    const onUpdate = vi.fn((id: string, input) =>
      api.updateSection(draftId, id, input),
    );
    render(<SectionEditor initial={section} onUpdate={onUpdate} />);

    expect(screen.getByLabelText("Titre de la section")).toHaveAttribute(
      "readonly",
    );
    fireEvent.change(screen.getByLabelText("Texte"), {
      target: { value: "Texte relu." },
    });
    fireEvent.click(
      screen.getByRole("button", { name: "Enregistrer les modifications" }),
    );

    await waitFor(() =>
      expect(screen.getByRole("status")).toHaveTextContent(
        "Modifications enregistrées.",
      ),
    );
    expect(onUpdate).toHaveBeenCalledWith(section.id, {
      status: "edited",
      editedText: "Texte relu.",
      version: section.version,
    });
    const draft = await api.getDraft(draftId);
    expect(draft.sections?.[1]).toMatchObject({
      status: "edited",
      text: "Texte relu.",
      version: section.version + 1,
    });
  });

  it("refuse d'enregistrer un texte inchangé", () => {
    const onUpdate = vi.fn();
    render(<SectionEditor initial={section} onUpdate={onUpdate} />);
    fireEvent.click(
      screen.getByRole("button", { name: "Enregistrer les modifications" }),
    );
    expect(screen.getByLabelText("Texte")).toHaveAccessibleDescription(
      expect.stringContaining("Modifiez le texte"),
    );
    expect(onUpdate).not.toHaveBeenCalled();
  });

  it("explique un conflit de version (409) sans perdre le texte", async () => {
    const api = createMockReportsApi();
    const stale = { ...section, version: section.version - 1 };
    const onReload = vi.fn();
    render(
      <SectionEditor
        initial={stale}
        onReload={onReload}
        onUpdate={(id, input) => api.updateSection(draftId, id, input)}
      />,
    );
    fireEvent.change(screen.getByLabelText("Texte"), {
      target: { value: "Ma version" },
    });
    fireEvent.click(
      screen.getByRole("button", { name: "Enregistrer les modifications" }),
    );

    expect(await screen.findByRole("alert")).toHaveTextContent(
      /modifiées entre-temps par une autre personne/,
    );
    expect(screen.getByLabelText("Texte")).toHaveValue("Ma version");
    fireEvent.click(screen.getByRole("button", { name: "Recharger la section" }));
    expect(onReload).toHaveBeenCalledOnce();
  });

  it("garde le texte après « Recharger la section » et réenregistre avec la nouvelle version", async () => {
    const api = createMockReportsApi();
    const stale = { ...section, version: section.version - 1 };
    const onUpdate = vi.fn((id: string, input: Parameters<typeof api.updateSection>[2]) =>
      api.updateSection(draftId, id, input),
    );
    const { rerender } = render(
      <SectionEditor key={section.id} initial={stale} onUpdate={onUpdate} onReload={() => {}} />,
    );
    fireEvent.change(screen.getByLabelText("Texte"), {
      target: { value: "Ma version" },
    });
    fireEvent.click(
      screen.getByRole("button", { name: "Enregistrer les modifications" }),
    );
    await screen.findByRole("alert");

    // Le parent recharge la section : même clé, version à jour.
    rerender(
      <SectionEditor key={section.id} initial={section} onUpdate={onUpdate} onReload={() => {}} />,
    );
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
    expect(screen.getByRole("status")).toHaveTextContent(
      "Dernière version rechargée",
    );
    expect(screen.getByLabelText("Texte")).toHaveValue("Ma version");

    fireEvent.click(
      screen.getByRole("button", { name: "Enregistrer les modifications" }),
    );
    await waitFor(() =>
      expect(screen.getByRole("status")).toHaveTextContent(
        "Modifications enregistrées.",
      ),
    );
    expect(onUpdate).toHaveBeenLastCalledWith(section.id, {
      status: "edited",
      editedText: "Ma version",
      version: section.version,
    });
  });
});
