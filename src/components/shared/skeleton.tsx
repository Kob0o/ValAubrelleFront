import { cn } from "cn";
import type { ComponentProps } from "react";

export interface SkeletonProps extends ComponentProps<"div"> {
  /**
   * Forme du squelette : ligne de texte (`line`), bloc générique
   * (`block`) ou cellule de tableau (`cell`, 44 px).
   * Sans `shape`, la taille vient de `className` (usage libre).
   */
  shape?: "line" | "block" | "cell";
  /** Nombre de lignes rendues (avec `shape="line"`, > 1). */
  lines?: number;
}

const shapeClasses = {
  line: "h-4 w-full",
  block: "h-24 w-full",
  cell: "h-11 w-full",
} as const;

/**
 * Squelette de chargement décoratif.
 * La zone parente porte `aria-busy="true"` et un texte masqué
 * « Chargement… » ; les formes sont en `aria-hidden` et l'animation
 * est coupée si `prefers-reduced-motion` (via `motion-safe:`).
 */
export function Skeleton({
  shape,
  lines,
  className,
  ...props
}: SkeletonProps) {
  if (shape === "line" && lines && lines > 1) {
    return (
      <div
        aria-hidden="true"
        className={cn("flex flex-col gap-2", className)}
        {...props}
      >
        {Array.from({ length: lines }, (_, index) => (
          <div
            key={index}
            className="h-4 w-full rounded-md bg-muted motion-safe:animate-pulse"
          />
        ))}
      </div>
    );
  }

  return (
    <div
      aria-hidden="true"
      className={cn(
        "rounded-md bg-muted motion-safe:animate-pulse",
        shape && shapeClasses[shape],
        className,
      )}
      {...props}
    />
  );
}
