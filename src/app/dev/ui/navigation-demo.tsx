"use client";

import * as React from "react";
import { Info, Settings } from "lucide-react";

import { Breadcrumb } from "@/components/shared/breadcrumb";
import { IconButton } from "@/components/shared/icon-button";
import { Pagination } from "@/components/shared/pagination";
import { Tabs } from "@/components/shared/tabs";
import { Tooltip } from "@/components/shared/tooltip";

const sectionTitle =
  "text-xl font-semibold text-[color:var(--color-primary-strong)]";
const panel = "flex flex-col gap-3 rounded-xl bg-white p-4 ring-1 ring-border";

// Données fictives pour la démo.
const communeTabs = [
  { value: "synthese", label: "Synthèse", content: "Synthèse de la commune (démo)." },
  { value: "indicateurs", label: "Indicateurs", content: "Indicateurs de l'habitat (démo)." },
  { value: "sources", label: "Sources", content: "Sources (démo).", disabled: true },
  { value: "rapports", label: "Rapports", content: "Rapports publiés (démo)." },
  { value: "demandes", label: "Demandes", content: "Demandes en cours (démo)." },
];

function PaginationDemo({
  title,
  total,
  initialPage,
  loading,
  withSizes,
}: {
  title: string;
  total: number;
  initialPage: number;
  loading?: boolean;
  withSizes?: boolean;
}) {
  const [page, setPage] = React.useState(initialPage);
  const [size, setSize] = React.useState(20);
  const headingRef = React.useRef<HTMLHeadingElement>(null);

  return (
    <div className={panel}>
      <h3 ref={headingRef} tabIndex={-1} className="text-base font-semibold">
        {title}
      </h3>
      <Pagination
        page={page}
        size={size}
        total={total}
        loading={loading}
        onPageChange={setPage}
        onSizeChange={withSizes ? (next) => { setSize(next); setPage(1); } : undefined}
        focusTargetRef={headingRef}
      />
    </div>
  );
}

export function NavigationDemo() {
  return (
    <>
      <section className="flex flex-col gap-4" aria-labelledby="breadcrumb-title">
        <h2 id="breadcrumb-title" className={sectionTitle}>
          Breadcrumb
        </h2>
        <div className={panel}>
          <Breadcrumb
            items={[
              { label: "Accueil", href: "/dev/ui" },
              { label: "Communes", href: "/dev/ui#communes" },
              { label: "Brévannes", href: "/dev/ui#brevannes" },
            ]}
            current="Indicateurs"
          />
          <Breadcrumb items={[{ label: "Accueil", href: "/dev/ui" }]} current="Communes" />
        </div>
        <p className="text-base text-muted-foreground">
          À 390 px : le premier niveau et la page courante restent visibles,
          « … » déplie les niveaux intermédiaires.
        </p>
      </section>

      <section className="flex flex-col gap-4" aria-labelledby="tabs-title">
        <h2 id="tabs-title" className={sectionTitle}>
          Tabs
        </h2>
        <div className={panel}>
          <Tabs items={communeTabs} label="Fiche commune (démo)" syncWithUrl />
        </div>
        <p className="text-base text-muted-foreground">
          Flèches gauche / droite, Début / Fin ; « Sources » est désactivé.
          L&apos;onglet est gardé dans l&apos;URL (<code>?onglet=</code>).
        </p>
      </section>

      <section className="flex flex-col gap-4" aria-labelledby="tooltip-title">
        <h2 id="tooltip-title" className={sectionTitle}>
          Tooltip
        </h2>
        <div className="flex flex-wrap items-center gap-3 rounded-xl bg-white p-4 ring-1 ring-border">
          <Tooltip content="Valeur masquée : moins de 11 ménages concernés.">
            <button
              type="button"
              className="inline-flex min-h-11 items-center gap-2 rounded-lg px-3 text-base text-foreground underline decoration-dotted underline-offset-4 focus-visible:outline-3 focus-visible:outline-offset-3 focus-visible:outline-[color:var(--color-primary-strong)]"
            >
              <Info aria-hidden className="size-4" />
              Masquée
            </button>
          </Tooltip>
          <IconButton label="Ouvrir les paramètres" tooltip>
            <Settings aria-hidden />
          </IconButton>
        </div>
        <p className="text-base text-muted-foreground">
          Survol, focus clavier ou toucher ; Échap ferme l&apos;info-bulle.
        </p>
      </section>

      <section className="flex flex-col gap-4" aria-labelledby="pagination-title">
        <h2 id="pagination-title" className={sectionTitle}>
          Pagination
        </h2>
        <PaginationDemo title="Première page" total={134} initialPage={1} />
        <PaginationDemo title="Page intermédiaire, ellipses et tailles" total={240} initialPage={5} withSizes />
        <PaginationDemo title="Dernière page" total={134} initialPage={7} />
        <PaginationDemo title="Chargement" total={134} initialPage={2} loading />
        <div className={panel}>
          <h3 className="text-base font-semibold">Une seule page</h3>
          <Pagination
            page={1}
            size={20}
            total={12}
            onPageChange={() => {}}
            focusTargetRef={{ current: null }}
          />
          <p className="text-base text-muted-foreground">
            12 résultats : la pagination est masquée.
          </p>
        </div>
      </section>
    </>
  );
}
