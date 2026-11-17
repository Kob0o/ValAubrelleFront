import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { ReportsDemo } from "@/app/dev/reports/reports-demo";
import { isDevPagesEnabled } from "@/lib/dev-pages";

export const metadata: Metadata = {
  title: "Démo de la rédaction des sections — Val d'Aubrelle",
  robots: { index: false, follow: false },
};

export default function DevReportsPage() {
  if (!isDevPagesEnabled()) {
    notFound();
  }

  return <ReportsDemo />;
}
