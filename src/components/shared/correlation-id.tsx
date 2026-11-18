"use client";

import { useState } from "react";
import { CheckIcon, CopyIcon } from "lucide-react";

import { IconButton } from "@/components/shared/icon-button";

type CopyState = "idle" | "copied" | "failed";

const copyMessages: Record<CopyState, string> = {
  idle: "",
  copied: "Référence copiée",
  failed: "Copie impossible : sélectionnez le texte",
};

type CorrelationIdProps = {
  /** UUID renvoyé par le serveur sur une erreur 5xx. */
  id: string;
  label?: string;
};

/**
 * Référence technique d'une erreur 5xx, à transmettre au support.
 * Lisible, sélectionnable et copiable, sans aucun autre détail technique.
 */
function CorrelationId({
  id,
  label = "Référence de l'erreur",
}: CorrelationIdProps) {
  const [state, setState] = useState<CopyState>("idle");

  async function copy() {
    // Repartir de « idle » pour que le message soit réannoncé à chaque clic.
    setState("idle");
    try {
      if (!navigator.clipboard) throw new Error("Presse-papiers indisponible");
      await navigator.clipboard.writeText(id);
      setState("copied");
    } catch {
      // La référence reste sélectionnable à la main.
      setState("failed");
    }
  }

  return (
    <span className="flex flex-col gap-1 text-base text-[color:var(--color-text)]">
      <span className="flex flex-wrap items-center gap-2">
        <span>
          {label} :{" "}
          <code className="font-sans break-all select-all">{id}</code>
        </span>
        <IconButton label="Copier la référence" variant="outline" onClick={copy}>
          {state === "copied" ? <CheckIcon aria-hidden /> : <CopyIcon aria-hidden />}
        </IconButton>
      </span>
      <span
        aria-live="polite"
        className={
          state === "failed"
            ? "text-[color:var(--color-danger)]"
            : "text-[color:var(--color-text-muted)]"
        }
      >
        {copyMessages[state]}
      </span>
    </span>
  );
}

export { CorrelationId };
export type { CorrelationIdProps };
