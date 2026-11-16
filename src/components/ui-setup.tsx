import type { ReactNode } from "react";

import { Toaster } from "@/components/ui/sonner";

export function UISetup({ children }: { children: ReactNode }) {
  return (
    <>
      <a className="skip-link" href="#contenu">
        Aller au contenu
      </a>
      {children}
      <Toaster theme="light" position="top-right" />
    </>
  );
}
