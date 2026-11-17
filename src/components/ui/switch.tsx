"use client"

import * as React from "react"
import { cn } from "cn"
import { Switch as SwitchPrimitive } from "radix-ui"

/**
 * Généré par `shadcn add switch`, adapté à la charte (contrat UI/UX §3, §6) :
 * rail de 44 × 24 px, `role="switch"` et `aria-checked` fournis par Radix.
 * Éteint : rail Gris ardoise, pastille à gauche ; allumé : rail Vert
 * Aubrelle, pastille à droite (le déplacement est le repère, pas la couleur
 * seule). Focus Vert forêt. Désactivé : rail Brume bordé, pastille grise
 * (distinct d'un interrupteur éteint), pas d'opacité.
 */
function Switch({
  className,
  ...props
}: React.ComponentProps<typeof SwitchPrimitive.Root>) {
  return (
    <SwitchPrimitive.Root
      data-slot="switch"
      className={cn(
        "group/switch peer inline-flex h-6 w-11 shrink-0 items-center rounded-full border-2 border-transparent bg-input transition-colors outline-none",
        "data-[state=checked]:bg-primary",
        "focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
        "aria-invalid:ring-2 aria-invalid:ring-destructive aria-invalid:ring-offset-2",
        "disabled:cursor-not-allowed disabled:border-input disabled:bg-muted aria-disabled:cursor-not-allowed",
        className
      )}
      {...props}
    >
      <SwitchPrimitive.Thumb
        data-slot="switch-thumb"
        className="pointer-events-none block size-5 rounded-full bg-background group-disabled/switch:size-4 group-disabled/switch:bg-muted-foreground group-disabled/switch:data-[state=checked]:translate-x-[1.375rem] group-disabled/switch:data-[state=unchecked]:translate-x-0.5 shadow-[var(--shadow-sm)] transition-transform data-[state=checked]:translate-x-5 data-[state=unchecked]:translate-x-0 motion-reduce:transition-none"
      />
    </SwitchPrimitive.Root>
  )
}

export { Switch }
