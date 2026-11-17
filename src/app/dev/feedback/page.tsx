import { notFound } from "next/navigation";

import { CorrelationId } from "@/components/shared/correlation-id";
import { StatusBadge, type StatusBadgeProps } from "@/components/shared/status-badge";
import {
  statusLabelsByKind,
  type StatusKind,
} from "@/components/shared/status-badge.config";

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
  if (process.env.NODE_ENV === "production") {
    notFound();
  }

  return (
    <main
      id="contenu"
      className="mx-auto flex w-full max-w-5xl flex-col gap-10 px-4 py-8"
    >
      <header className="flex flex-col gap-2">
        <h1 className="text-2xl font-extrabold text-[color:var(--color-primary-strong)]">
          Catalogue retours — G3
        </h1>
        <p className="text-base text-muted-foreground">
          Page de démo masquée en production. Les 19 statuts en tailles
          standard et compacte, puis la référence d&apos;erreur copiable.
        </p>
      </header>

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
    </main>
  );
}
