import * as React from "react"
import { cn } from "cn"

/**
 * Adapté à la charte (contrat UI/UX §3, §4, §6) : 44 px, texte 16 px à toutes
 * les tailles, bordure `--input` (Gris ardoise, 3:1), focus bordure Vert
 * Aubrelle + anneau Vert forêt, erreur en bordure épaisse, désactivé lisible
 * (pas d'opacité) et lecture seule distincte (pointillés, fond Brume).
 */
function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        "h-11 w-full min-w-0 rounded-md border border-input bg-background px-3 py-2 text-base text-foreground transition-colors outline-none file:inline-flex file:h-8 file:border-0 file:bg-transparent file:text-base file:font-semibold file:text-foreground placeholder:text-muted-foreground",
        "focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-ring",
        "aria-invalid:border-2 aria-invalid:border-destructive aria-invalid:focus-visible:ring-destructive",
        "disabled:cursor-not-allowed disabled:border-border disabled:bg-muted disabled:text-muted-foreground",
        "read-only:not-disabled:border-dashed read-only:not-disabled:bg-muted",
        className
      )}
      {...props}
    />
  )
}

export { Input }
