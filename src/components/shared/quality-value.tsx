"use client";

import { useEffect } from "react";

import { Link } from "@/components/shared/link";
import {
  qualityStatusInfo,
  type UnavailableQualityStatus,
} from "@/components/shared/quality-value.config";
import { Tooltip } from "@/components/shared/tooltip";
import { formatValue, type ValueFormat } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { IndicatorValue } from "@/types/domain";

type QualityValueProps = {
  value: Pick<IndicatorValue, "value" | "status">;
  unit?: string;
  format?: ValueFormat;
  precision?: number;
  /** `compact` : explication en info-bulle (tableaux, carte) ; `detailed` : en texte. */
  variant?: "compact" | "detailed";
  /** Lien « En savoir plus » vers l'explication de la diffusion (P7). */
  explanationHref?: string;
  className?: string;
};

/**
 * Valeur d'indicateur et ses 6 statuts de qualité. Une valeur absente n'est
 * jamais affichée comme un zéro : elle est remplacée par son statut expliqué.
 */
function QualityValue({
  value: { value, status },
  unit,
  format,
  precision,
  variant = "compact",
  explanationHref,
  className,
}: QualityValueProps) {
  const inconsistent = status === "available" && value == null;

  useEffect(() => {
    if (inconsistent && process.env.NODE_ENV !== "production") {
      console.warn(
        "QualityValue : statut « available » reçu avec une valeur null, affiché comme donnée absente.",
      );
    }
  }, [inconsistent]);

  if (status === "available" && value != null) {
    return (
      <span
        data-slot="quality-value"
        data-status="available"
        className={cn("tabular-nums text-[color:var(--color-text)]", className)}
      >
        {formatValue(value, { format, precision, unit })}
      </span>
    );
  }

  const unavailable: UnavailableQualityStatus =
    status === "available" ? "missing" : status;
  const { icon: Icon, label, reason, explanation } = qualityStatusInfo[unavailable];

  if (variant === "detailed") {
    return (
      <span
        data-slot="quality-value"
        data-status={unavailable}
        className={cn(
          "inline-flex flex-col gap-1 text-base text-[color:var(--color-text-muted)]",
          className,
        )}
      >
        <span className="inline-flex items-center gap-2 font-semibold">
          <Icon aria-hidden className="size-4 shrink-0" />
          {label}
        </span>
        <span>{explanation}</span>
        {explanationHref ? (
          <Link href={explanationHref} className="w-fit">
            En savoir plus<span className="sr-only"> : {label}</span>
          </Link>
        ) : null}
      </span>
    );
  }

  return (
    <span
      data-slot="quality-value"
      data-status={unavailable}
      className={cn("inline-flex", className)}
    >
      <Tooltip content={explanation}>
        <button
          type="button"
          className="inline-flex min-h-11 items-center justify-end rounded-sm text-base text-[color:var(--color-text-muted)] underline decoration-dotted underline-offset-4 focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-[color:var(--color-primary-strong)]"
        >
          {/* Icône en ligne dans le texte : sur plusieurs lignes, elle reste
              collée au premier mot et l'écart est identique sur toute la colonne. */}
          <span className="text-right">
            <Icon
              aria-hidden
              className="mr-1 inline size-4 align-[-0.125em]"
            />
            {label}
            <span className="sr-only">, {reason}</span>
          </span>
        </button>
      </Tooltip>
    </span>
  );
}

export { QualityValue };
export type { QualityValueProps };
