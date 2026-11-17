import { cn } from "@/lib/utils";

import {
  resolveStatus,
  type StatusByKind,
  type StatusKind,
  type StatusTone,
} from "@/components/shared/status-badge.config";

/**
 * Fond blanc, texte et contour dans la couleur d'état : chaque couple est
 * contrôlé (texte ≥ 4,5:1, contour ≥ 3:1) dans status-badge.test.tsx.
 */
const toneClasses: Record<StatusTone, string> = {
  neutral:
    "text-[color:var(--color-text)] border-[color:var(--color-text-muted)]",
  info: "text-[color:var(--color-info)] border-[color:var(--color-info)]",
  success:
    "text-[color:var(--color-success)] border-[color:var(--color-success)]",
  warning:
    "text-[color:var(--color-warning)] border-[color:var(--color-warning)]",
  danger: "text-[color:var(--color-danger)] border-[color:var(--color-danger)]",
};

const sizeClasses = {
  compact: "gap-1 px-2 py-0.5 text-sm",
  standard: "gap-2 px-3 py-1 text-base",
} as const;

type StatusBadgeProps = {
  [K in StatusKind]: {
    kind: K;
    status: StatusByKind[K];
    size?: keyof typeof sizeClasses;
    className?: string;
  };
}[StatusKind];

function StatusBadge({
  kind,
  status,
  size = "standard",
  className,
}: StatusBadgeProps) {
  const { known, label, icon: Icon, tone } = resolveStatus(kind, status);

  if (!known && process.env.NODE_ENV !== "production") {
    console.warn(`StatusBadge : statut « ${status} » inconnu pour « ${kind} ».`);
  }

  return (
    <span
      data-slot="status-badge"
      data-kind={kind}
      data-status={known ? status : "unknown"}
      data-tone={tone}
      className={cn(
        "inline-flex w-fit shrink-0 items-center rounded-full border bg-[color:var(--color-surface)] font-semibold whitespace-nowrap",
        sizeClasses[size],
        toneClasses[tone],
        className,
      )}
    >
      <Icon aria-hidden className="size-4 shrink-0" />
      {label}
    </span>
  );
}

export { StatusBadge };
export type { StatusBadgeProps };
