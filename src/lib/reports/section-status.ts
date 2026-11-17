import { statusVisuals, type StatusTone } from "@/components/shared/status-badge.config";
import {
  SECTION_STATUSES,
  type SectionStatus,
} from "@/types/domain";

/** Pastille des compteurs : même ton que le StatusBadge de la section. */
const toneDotClass: Record<StatusTone, string> = {
  neutral: "bg-[color:var(--color-text-muted)]",
  info: "bg-[color:var(--color-info)]",
  success: "bg-[color:var(--color-success)]",
  warning: "bg-[color:var(--color-warning)]",
  danger: "bg-[color:var(--color-danger)]",
};

/** Forme des compteurs (le libellé du statut vient de `statusLabels.section`). */
const counterWords: Record<SectionStatus, [singular: string, plural: string]> = {
  to_review: ["à revoir", "à revoir"],
  accepted: ["acceptée", "acceptées"],
  edited: ["modifiée", "modifiées"],
  excluded: ["exclue", "exclues"],
};

export function sectionStatusDotClass(status: SectionStatus) {
  return toneDotClass[statusVisuals.section[status].tone];
}

export function countByStatus(
  sections: ReadonlyArray<{ status?: SectionStatus }>,
): Record<SectionStatus, number> {
  const counts = Object.fromEntries(
    SECTION_STATUSES.map((status) => [status, 0]),
  ) as Record<SectionStatus, number>;
  for (const section of sections) {
    if (section.status) counts[section.status] += 1;
  }
  return counts;
}

/** « 3 à revoir », « 1 acceptée », « 0 exclue ». */
export function formatStatusCount(status: SectionStatus, count: number) {
  const [singular, plural] = counterWords[status];
  return `${count} ${count > 1 ? plural : singular}`;
}
