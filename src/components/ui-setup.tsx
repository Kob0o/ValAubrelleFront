import type { ReactNode } from "react";

import { FeedbackToaster } from "@/components/shared/toast";

export function UISetup({ children }: { children: ReactNode }) {
  return (
    <>
      <a className="skip-link" href="#contenu">
        Aller au contenu
      </a>
      {children}
      <FeedbackToaster />
    </>
  );
}
