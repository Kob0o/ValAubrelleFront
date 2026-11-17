import { notFound } from "next/navigation";

import { CorrelationId } from "@/components/shared/correlation-id";
import { QualityValue } from "@/components/shared/quality-value";
import { StatusBadge, type StatusBadgeProps } from "@/components/shared/status-badge";
import {
  statusLabelsByKind,
  type StatusKind,
} from "@/components/shared/status-badge.config";
import { isDevPagesEnabled } from "@/lib/dev-pages";
import { mockIndicatorValuesByQuality } from "@/mocks/quality-status";
import { QUALITY_STATUSES } from "@/types/domain";

import { FeedbackDemo } from "./feedback-demo";

const kindTitles: Record<StatusKind, string> = {
  request: "Demandes",
  report: "Rapports",
  source: "Sources",
  account: "Comptes",
  section: "Sections de rapport",
};

const kinds = Object.keys(kindTitles) as StatusKind[];

// Identifiant fictif, pour la démo uniquement.
const DEMO_CORRELATION_ID = "3f2b8c1e-9a4d-4e7b-8c21-5d6f0a1b2c3d";

export default function DevFeedbackPage() {
  if (!isDevPagesEnabled()) {
    notFound();
  }

  return (
    <main
      id="contenu"
      className="mx-auto flex w-full max-w-5xl flex-col gap-10 px-4 py-8"
    >
      <header className="flex flex-col gap-2">
        <h1 className="text-2xl font-extrabold text-[color:var(--color-primary-strong)]">
          Catalogue retours et dialogues — G3
        </h1>
        <p className="text-base text-muted-foreground">
          Page de démo masquée en production (sauf ENABLE_DEV_PAGES). Dialogues
          et retours (G3.A : Banner, Modal, Drawer, Toast, Skeleton, EmptyState,
          ConfirmDialog), les 19 statuts en tailles standard et compacte, la
          référence d&apos;erreur copiable et les 6 statuts de qualité
          d&apos;une valeur.
        </p>
      </header>

      <FeedbackDemo />

      <section className="flex flex-col gap-4" aria-labelledby="status-title">
        <h2
          id="status-title"
          className="text-xl font-semibold text-[color:var(--color-primary-strong)]"
        >
          StatusBadge
        </h2>
        {kinds.map((kind) => {
          const statuses = Object.keys(statusLabelsByKind[kind]);
          return (
            <div key={kind} className="flex flex-col gap-3">
              <h3 className="text-base font-semibold">
                {kindTitles[kind]} <code className="font-mono">{kind}</code>
              </h3>
              <div className="flex flex-wrap gap-3 rounded-xl bg-white p-4 ring-1 ring-border">
                {statuses.map((status) => (
                  <StatusBadge
                    key={status}
                    {...({ kind, status } as StatusBadgeProps)}
                  />
                ))}
              </div>
              <div className="flex flex-wrap gap-2 rounded-xl bg-[color:var(--color-surface-alt)] p-4 ring-1 ring-border">
                {statuses.map((status) => (
                  <StatusBadge
                    key={status}
                    size="compact"
                    {...({ kind, status } as StatusBadgeProps)}
                  />
                ))}
              </div>
            </div>
          );
        })}
        <div className="flex flex-col gap-3">
          <h3 className="text-base font-semibold">Statut inconnu</h3>
          <div className="flex flex-wrap gap-3 rounded-xl bg-white p-4 ring-1 ring-border">
            <StatusBadge
              {...({ kind: "request", status: "archived" } as unknown as StatusBadgeProps)}
            />
          </div>
        </div>
      </section>

      <section className="flex flex-col gap-4" aria-labelledby="correlation-title">
        <h2
          id="correlation-title"
          className="text-xl font-semibold text-[color:var(--color-primary-strong)]"
        >
          CorrelationId
        </h2>
        <div className="rounded-xl bg-white p-4 ring-1 ring-border">
          <CorrelationId id={DEMO_CORRELATION_ID} />
        </div>
      </section>

      <section className="flex flex-col gap-4" aria-labelledby="quality-title">
        <h2
          id="quality-title"
          className="text-xl font-semibold text-[color:var(--color-primary-strong)]"
        >
          QualityValue
        </h2>
        <p className="text-base text-muted-foreground">
          Prix au m² 2024, fixtures fictives de <code>src/mocks/quality-status.ts</code>.
        </p>
        <div className="overflow-x-auto rounded-xl bg-white ring-1 ring-border">
          <table className="w-full text-left text-base">
            <caption className="sr-only">
              Les 6 statuts de qualité en variantes compacte et détaillée
            </caption>
            <thead>
              <tr className="border-b border-border">
                <th scope="col" className="p-3 font-semibold">Statut</th>
                <th scope="col" className="p-3 text-right font-semibold">Compact</th>
                <th scope="col" className="p-3 font-semibold">Détaillé</th>
              </tr>
            </thead>
            <tbody>
              {QUALITY_STATUSES.map((status) => (
                <tr key={status} className="border-b border-border last:border-0">
                  <th scope="row" className="p-3 align-top font-normal">
                    <code className="font-mono">{status}</code>
                  </th>
                  <td className="p-3 text-right align-top">
                    <QualityValue
                      value={mockIndicatorValuesByQuality[status]}
                      unit="€/m²"
                    />
                  </td>
                  <td className="p-3 align-top">
                    <QualityValue
                      value={mockIndicatorValuesByQuality[status]}
                      unit="€/m²"
                      variant="detailed"
                      explanationHref="/dev/feedback#quality-title"
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="flex flex-col gap-2 rounded-xl bg-[color:var(--color-surface-alt)] p-4 ring-1 ring-border">
          <h3 className="text-base font-semibold">
            Incohérence : <code className="font-mono">available</code> avec une valeur null
          </h3>
          <QualityValue value={{ value: null, status: "available" }} />
        </div>
      </section>
    </main>
  );
}
