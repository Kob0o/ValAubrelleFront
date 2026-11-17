import {
  Calculator,
  CircleDashed,
  EyeOff,
  TriangleAlert,
  UsersRound,
  type LucideIcon,
} from "lucide-react";

import { statusLabels, type QualityStatus } from "@/types/domain";

export type UnavailableQualityStatus = Exclude<QualityStatus, "available">;

export type QualityStatusInfo = {
  icon: LucideIcon;
  label: string;
  /** Complément court lu après le libellé : « Non diffusable, secret statistique ». */
  reason: string;
  /** Explication complète (info-bulle en compact, texte en detailed). */
  explanation: string;
};

/** Libellés partagés avec `statusLabels.quality` (src/types/domain.ts). */
export const qualityStatusInfo: Record<UnavailableQualityStatus, QualityStatusInfo> = {
  missing: {
    icon: CircleDashed,
    label: statusLabels.quality.missing,
    reason: "aucune donnée publiée",
    explanation:
      "Aucune donnée n'est publiée pour ce territoire et cette période.",
  },
  insufficient_sample: {
    icon: UsersRound,
    label: statusLabels.quality.insufficient_sample,
    reason: "trop peu d'observations",
    explanation:
      "Trop peu d'observations pour produire une valeur fiable sur ce territoire.",
  },
  suppressed: {
    icon: EyeOff,
    label: statusLabels.quality.suppressed,
    reason: "secret statistique",
    explanation:
      "Valeur masquée au titre du secret statistique, pour protéger les personnes concernées.",
  },
  source_error: {
    icon: TriangleAlert,
    label: statusLabels.quality.source_error,
    reason: "source indisponible",
    explanation:
      "La source n'a pas pu être chargée. La valeur reviendra à la prochaine actualisation de la source.",
  },
  not_computable: {
    icon: Calculator,
    label: statusLabels.quality.not_computable,
    reason: "calcul impossible",
    explanation:
      "L'indicateur ne peut pas être calculé pour ce territoire avec les données disponibles.",
  },
};
