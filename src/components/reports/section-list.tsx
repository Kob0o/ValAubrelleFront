"use client";

import { useRef, type KeyboardEvent } from "react";
import { cn } from "cn";

import { StatusBadge } from "@/components/shared/status-badge";
import {
  countByStatus,
  formatStatusCount,
  sectionStatusDotClass,
} from "@/lib/reports/section-status";
import { SECTION_STATUSES, type Section } from "@/types/domain";

/** Champs optionnels dans le contrat : l'appelant fournit des sections complètes. */
export type SectionListItem = Required<
  Pick<Section, "id" | "order" | "title" | "status">
>;

export type SectionListProps = {
  sections: ReadonlyArray<SectionListItem>;
  activeId?: string | null;
  onSelect: (sectionId: string) => void;
};

const NAV_KEYS = ["ArrowDown", "ArrowUp", "Home", "End"];

export function SectionList({ sections, activeId, onSelect }: SectionListProps) {
  const listRef = useRef<HTMLOListElement>(null);

  if (sections.length === 0) {
    return (
      <p className="text-base text-[var(--color-text-muted)]">
        Aucune section pour l&apos;instant. Rédigez la première avec le
        formulaire.
      </p>
    );
  }

  const ordered = [...sections].sort((a, b) => a.order - b.order);
  const counts = countByStatus(sections);

  function handleKeyDown(event: KeyboardEvent<HTMLOListElement>) {
    if (!NAV_KEYS.includes(event.key)) return;
    const buttons = Array.from(
      listRef.current?.querySelectorAll<HTMLButtonElement>(
        "button[data-section-id]",
      ) ?? [],
    );
    const current = buttons.indexOf(
      document.activeElement as HTMLButtonElement,
    );
    if (current === -1) return;
    event.preventDefault();
    const last = buttons.length - 1;
    const next =
      event.key === "Home"
        ? 0
        : event.key === "End"
          ? last
          : event.key === "ArrowDown"
            ? Math.min(current + 1, last)
            : Math.max(current - 1, 0);
    buttons[next]?.focus();
  }

  return (
    <div className="flex flex-col gap-3">
      <div>
        <p className="text-base font-semibold">
          {sections.length} section{sections.length > 1 ? "s" : ""}
        </p>
        <ul
          aria-label="Répartition par statut"
          className="flex flex-wrap gap-x-4 gap-y-1 text-base"
        >
          {SECTION_STATUSES.map((status) => (
            <li
              key={status}
              data-status={status}
              className="inline-flex items-center gap-1.5"
            >
              <span
                aria-hidden="true"
                className={cn(
                  "size-2 rounded-full",
                  sectionStatusDotClass(status),
                )}
              />
              {formatStatusCount(status, counts[status])}
            </li>
          ))}
        </ul>
      </div>

      <nav aria-label="Sections du rapport">
        <ol ref={listRef} onKeyDown={handleKeyDown} className="flex flex-col gap-1">
          {ordered.map((section) => {
            const isActive = section.id === activeId;
            return (
              <li key={section.id}>
                <button
                  type="button"
                  data-section-id={section.id}
                  aria-current={isActive ? "true" : undefined}
                  onClick={() => onSelect(section.id)}
                  className={cn(
                    "flex min-h-11 w-full items-center justify-between gap-3 rounded-md border-l-4 px-3 py-2 text-left outline-none text-base transition-colors hover:bg-muted focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-primary-strong)]",
                    isActive
                      ? "border-[var(--color-primary)] bg-[var(--color-surface-alt)] font-semibold"
                      : "border-transparent",
                  )}
                >
                  <span>
                    <span className="text-[var(--color-text-muted)]">
                      {section.order}.{" "}
                    </span>
                    {section.title}
                  </span>
                  <StatusBadge kind="section" status={section.status} />
                </button>
              </li>
            );
          })}
        </ol>
      </nav>
    </div>
  );
}
