"use client";

import { useState } from "react";
import { CheckIcon, CopyIcon } from "lucide-react";

import { Button } from "@/components/ui/button";

/**
 * Référence technique d'une erreur 5xx, à transmettre au support.
 * Lisible et copiable, sans aucun autre détail technique.
 */
export function CorrelationId({ value }: { value: string }) {
  const [copied, setCopied] = useState(false);

  async function copy() {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
    } catch {
      // Presse-papiers refusé : la référence reste sélectionnable à la main.
    }
  }

  return (
    <span className="flex flex-wrap items-center gap-2 text-base text-muted-foreground">
      <span>
        Référence : <code className="font-mono select-all">{value}</code>
      </span>
      <Button
        type="button"
        variant="outline"
        className="min-h-11 text-base"
        onClick={copy}
      >
        {copied ? <CheckIcon aria-hidden /> : <CopyIcon aria-hidden />}
        {copied ? "Référence copiée" : "Copier la référence"}
      </Button>
    </span>
  );
}
