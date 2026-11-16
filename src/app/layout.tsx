import type { CSSProperties } from "react";
import type { Metadata } from "next";
import { Inter } from "next/font/google";

import { UISetup } from "@/components/ui-setup";
import { getActiveTheme } from "@/theme/themes";

import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "600", "800"],
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
