import type { CSSProperties } from "react";
import type { Metadata } from "next";
import { Inter } from "next/font/google";

import { UISetup } from "@/components/ui-setup";
import { getActiveTheme } from "@/theme/themes";

import "./globals.css";

// Police variable : toutes les graisses, dont 666 pour les badges (contrat §4).
const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Observatoire de l'habitat — Val d'Aubrelle",
  description:
    "Socle d’interface de l’Observatoire de l’habitat : charte graphique et thème partagé.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="fr"
      className={`${inter.variable} h-full`}
      style={getActiveTheme().cssVariables as CSSProperties}
    >
      <body className="flex min-h-full flex-col bg-background text-base font-normal text-foreground antialiased">
        <UISetup>{children}</UISetup>
      </body>
    </html>
  );
}
