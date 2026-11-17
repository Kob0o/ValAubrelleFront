"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

import { SectionEditor } from "@/components/reports/section-editor";
import {
  SectionList,
  type SectionListItem,
} from "@/components/reports/section-list";
import { Button } from "@/components/ui/button";
import { buildApiError } from "@/lib/api/errors";
import type { ReportsApi } from "@/lib/api/reports";
import { mockReportDraft } from "@/mocks/report-draft";
import { createMockReportsApi } from "@/mocks/reports-api";
import type { ReportDraft } from "@/types/domain";

type SimulatedError = "none" | "server" | "unavailable" | "conflict";

export function ReportsDemo() {
  const baseApi = useMemo(() => createMockReportsApi({ latency: 600 }), []);
  const [simulated, setSimulated] = useState<SimulatedError>("none");
  const [draft, setDraft] = useState<ReportDraft | null>(null);
  const [activeId, setActiveId] = useState<string | null>(null);

  const api: ReportsApi = useMemo(() => {
    const fail = () => {
      if (simulated === "server")
        throw buildApiError({
          httpStatus: 500,
          correlationId: globalThis.crypto.randomUUID(),
        });
      if (simulated === "unavailable")
        throw buildApiError({ httpStatus: 503 });
    };
    const failUpdate = () => {
      if (simulated === "conflict") throw buildApiError({ httpStatus: 409 });
      fail();
    };
    return {
      ...baseApi,
      kind: baseApi.kind,
      async createSection(...args) {
        await new Promise((resolve) => setTimeout(resolve, 600));
        fail();
        return baseApi.createSection(...args);
      },
      async updateSection(...args) {
        await new Promise((resolve) => setTimeout(resolve, 600));
        failUpdate();
        return baseApi.updateSection(...args);
      },
    };
  }, [baseApi, simulated]);

  const reload = useCallback(async () => {
    setDraft(await baseApi.getDraft(mockReportDraft.id));
  }, [baseApi]);

  useEffect(() => {
    let mounted = true;
    void baseApi.getDraft(mockReportDraft.id).then((fresh) => {
      if (mounted) setDraft(fresh);
    });
    return () => {
      mounted = false;
    };
  }, [baseApi]);

  const sections: SectionListItem[] = (draft?.sections ?? []).flatMap((s) =>
    s.id && s.title && s.order !== undefined && s.status
      ? [{ id: s.id, title: s.title, order: s.order, status: s.status }]
      : [],
  );
  const active = draft?.sections?.find((s) => s.id === activeId);

  return (
    <main className="mx-auto flex w-full max-w-6xl flex-col gap-6 p-4 md:p-8">
      <header className="flex flex-col gap-2">
        <h1 className="text-3xl font-extrabold text-[var(--color-primary-strong)]">
          Rédaction des sections (G0.I)
        </h1>
        <p
          role="note"
          className="rounded-[var(--radius)] border-2 border-dashed border-[var(--color-warning)] bg-[var(--color-surface-alt)] px-3 py-2 text-base text-[var(--color-text)]"
        >
          <strong>Données fictives — client {api.kind}.</strong> Les routes
          du contrat ne sont pas encore implémentées par le back : les
          réponses sont simulées.
        </p>
        <fieldset className="flex flex-wrap items-center gap-4 text-base">
          <legend className="mb-1 font-semibold">Simuler une réponse</legend>
          {(
            [
              ["none", "Succès"],
              ["server", "Erreur 500"],
              ["unavailable", "Service indisponible (503)"],
              ["conflict", "Conflit de version (409, modification)"],
            ] as const
          ).map(([value, label]) => (
            <label key={value} className="flex min-h-11 items-center gap-2">
              <input
                type="radio"
                name="simulated"
                value={value}
                checked={simulated === value}
                onChange={() => setSimulated(value)}
                className="size-5 accent-[var(--color-primary)]"
              />
              {label}
            </label>
          ))}
        </fieldset>
      </header>

      <div className="grid gap-8 md:grid-cols-[minmax(16rem,22rem)_1fr]">
        <section aria-labelledby="sections-title" className="flex flex-col gap-3">
          <h2 id="sections-title" className="text-xl font-semibold">
            {draft?.title ?? "Chargement du brouillon…"}
          </h2>
          {draft ? (
            <SectionList
              sections={sections}
              activeId={activeId}
              onSelect={setActiveId}
            />
          ) : null}
          <div>
            <Button
              type="button"
              variant="secondary"
              onClick={() => setActiveId(null)}
              disabled={activeId === null}
            >
              Nouvelle section
            </Button>
          </div>
        </section>

        <section aria-labelledby="editor-title" className="flex flex-col gap-3">
          <h2 id="editor-title" className="text-xl font-semibold">
            {active ? `Modifier « ${active.title} »` : "Nouvelle section"}
          </h2>
          {active?.id &&
          active.title !== undefined &&
          active.text !== undefined &&
          active.version !== undefined ? (
            <SectionEditor
              key={active.id}
              initial={{
                id: active.id,
                title: active.title,
                text: active.text,
                version: active.version,
              }}
              onUpdate={async (sectionId, input) => {
                await api.updateSection(mockReportDraft.id, sectionId, input);
                await reload();
              }}
              onReload={() => {
                void reload().then(() => setActiveId(null));
              }}
            />
          ) : (
            <SectionEditor
              onCreate={async (input, key) => {
                await api.createSection(mockReportDraft.id, input, key);
                await reload();
              }}
            />
          )}
        </section>
      </div>
    </main>
  );
}
