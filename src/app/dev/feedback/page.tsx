import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { FeedbackDemo } from "./feedback-demo";

export const metadata: Metadata = {
  title: "Démo retours et dialogues — Observatoire de l'habitat",
  description:
    "Page de démonstration des composants de retour et de dialogue (lot G3.A) : Banner, Modal, Drawer, Toast, Skeleton, EmptyState et ConfirmDialog.",
};

export default function FeedbackDemoPage() {
  // Page de démo : 404 en production, sauf build explicite avec
  // ENABLE_DEV_PAGES=true (convention des pages /dev de l'équipe).
  if (
    process.env.NODE_ENV === "production" &&
    process.env.ENABLE_DEV_PAGES !== "true"
  ) {
    notFound();
  }

  return (
    <main
      id="contenu"
      className="mx-auto flex w-full max-w-5xl flex-1 flex-col gap-10 px-6 py-10"
    >
      <header className="flex flex-col gap-3 border-t-4 border-[var(--color-accent)] pt-4">
        <p className="text-base font-semibold text-[var(--color-primary)]">
          Lot G3.A · composants partagés
        </p>
        <h1 className="text-4xl font-extrabold tracking-tight text-[var(--color-primary-strong)]">
          Retours et dialogues
        </h1>
        <p className="max-w-2xl text-base text-[var(--color-text)]">
          Démonstration des sept composants du lot : Banner, Modal, Drawer,
          Toast, Skeleton, EmptyState et ConfirmDialog. Focus piégé, fermeture
          par Échap et retour du focus sur le déclencheur à tester au clavier.
        </p>
      </header>

      <FeedbackDemo />
    </main>
  );
}
