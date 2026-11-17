"use client"

import * as React from "react"
import { cn } from "cn"
import { Checkbox as CheckboxPrimitive } from "radix-ui"
import { CheckIcon, MinusIcon } from "lucide-react"

/**
 * Généré par `shadcn add checkbox`, adapté à la charte (contrat UI/UX §3, §6) :
 * case de 20 px, bordure `--input` (3:1), cochée en Vert Aubrelle **avec** une
 * coche (ou un tiret si indéterminée) : jamais la couleur seule. Focus Vert
 * forêt, erreur en bordure épaisse, désactivé lisible (pas d'opacité).
 * Radix expose l'état par `data-state` (`checked`, `unchecked`, `indeterminate`).
 * La zone cliquable de 44 px est portée par le libellé (`forms/checkbox`).
 */
function Checkbox({
  className,
  ...props
}: React.ComponentProps<typeof CheckboxPrimitive.Root>) {
  return (
    <CheckboxPrimitive.Root
      data-slot="checkbox"
      className={cn(
        "group/checkbox peer flex size-5 shrink-0 items-center justify-center rounded-sm border border-input bg-background text-primary-foreground transition-colors outline-none",
        "data-[state=checked]:border-primary data-[state=checked]:bg-primary data-[state=indeterminate]:border-primary data-[state=indeterminate]:bg-primary",
        "focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
        "aria-invalid:border-2 aria-invalid:border-destructive",
        "disabled:cursor-not-allowed disabled:border-muted-foreground disabled:bg-muted disabled:data-[state=checked]:bg-muted-foreground disabled:data-[state=indeterminate]:bg-muted-foreground",
        className
      )}
      {...props}
    >
      <CheckboxPrimitive.Indicator
        data-slot="checkbox-indicator"
        className="flex items-center justify-center [&>svg]:size-4"
      >
        <CheckIcon
          aria-hidden="true"
          strokeWidth={3}
          className="hidden group-data-[state=checked]/checkbox:block"
        />
        <MinusIcon
          aria-hidden="true"
          strokeWidth={3}
          className="hidden group-data-[state=indeterminate]/checkbox:block"
        />
      </CheckboxPrimitive.Indicator>
    </CheckboxPrimitive.Root>
  )
}

export { Checkbox }
