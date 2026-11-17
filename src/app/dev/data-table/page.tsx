import type { Metadata } from "next";

import { DataTableDemo } from "./data-table-demo";

export const metadata: Metadata = {
  title: "Démo DataTable — Observatoire de l'habitat",
  description:
    "Page de démonstration du DataTable partagé (lot G0) : données, chargement, vide et erreur sur fixtures.",
};

export default function DataTableDemoPage() {
  return (
    <main
      id="contenu"
      className="mx-auto flex w-full max-w-5xl flex-1 flex-col gap-10 px-6 py-10"
    >
      <header className="flex flex-col gap-3 border-t-4 border-[var(--color-accent)] pt-4">
        <p className="text-base font-semibold text-[var(--color-primary)]">
          Lot G0 · composant partagé
        </p>
        <h1 className="text-4xl font-extrabold tracking-tight text-[var(--color-primary-strong)]">
          DataTable
        </h1>
        <p className="max-w-2xl text-base text-[var(--color-text)]">
          Démonstration sur fixtures (<code>src/mocks/</code>) des quatre
          états : données, chargement, vide et erreur. Tri serveur simulé,
          navigation clavier et sélection de ligne activées.
        </p>
      </header>

      <DataTableDemo />
    </main>
  );
}
