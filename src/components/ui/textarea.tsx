import * as React from "react"
import { cn } from "cn"

/** Mêmes règles que `Input` (charte, contraste, états) ; hauteur libre. */
function Textarea({ className, ...props }: React.ComponentProps<"textarea">) {
  return (
    <textarea
      data-slot="textarea"
      className={cn(
        "flex field-sizing-content min-h-24 w-full rounded-md border border-input bg-background px-3 py-2 text-base text-foreground transition-colors outline-none placeholder:text-muted-foreground",
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

export { Textarea }
