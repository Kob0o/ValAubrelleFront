import { cn } from "cn";
import type { ComponentProps } from "react";

/**
 * STUB temporaire (lot G0) — sera remplacé par le vrai composant Skeleton.
 * Ne pas enrichir : la fusion avec la version définitive est prévue au lot G3.
 */
export function Skeleton({ className, ...props }: ComponentProps<"div">) {
  return (
    <div
      aria-hidden="true"
      className={cn("animate-pulse rounded-md bg-muted", className)}
      {...props}
    />
  );
}
