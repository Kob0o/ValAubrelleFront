import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { FormsDemo } from "@/app/dev/forms/forms-demo";
import { isDevPagesEnabled } from "@/lib/dev-pages";

export const metadata: Metadata = {
  title: "Démo des champs de formulaire — Val d'Aubrelle",
  robots: { index: false, follow: false },
};

export default function DevFormsPage() {
  if (!isDevPagesEnabled()) {
    notFound();
  }

  return <FormsDemo />;
}
