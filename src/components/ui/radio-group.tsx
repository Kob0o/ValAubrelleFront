"use client"

import * as React from "react"
import { cn } from "cn"
import { RadioGroup as RadioGroupPrimitive } from "radix-ui"

/**
 * Généré par `shadcn add radio-group`, adapté à la charte (contrat UI/UX §3, §6).
 * Radix gère le clavier : flèches pour changer d'option, Tab pour sortir.
 */
function RadioGroup({
  className,
  ...props
}: React.ComponentProps<typeof RadioGroupPrimitive.Root>) {
  return (
    <RadioGroupPrimitive.Root
      data-slot="radio-group"
      className={cn("grid w-full gap-1", className)}
      {...props}
    />
  )
}

/**
 * Bouton radio de 20 px, bordure `--input` (3:1). Choisi : bordure et point
 * central Vert Aubrelle sur fond blanc (le point est le repère, pas la
 * couleur seule). Focus Vert forêt, erreur en bordure épaisse, désactivé
 * lisible. La zone cliquable de 44 px est portée par le libellé (`forms/radio-group`).
 */
function RadioGroupItem({
  className,
  ...props
}: React.ComponentProps<typeof RadioGroupPrimitive.Item>) {
  return (
    <RadioGroupPrimitive.Item
      data-slot="radio-group-item"
      className={cn(
        "group/radio peer flex size-5 shrink-0 items-center justify-center rounded-full border border-input bg-background transition-colors outline-none",
        "data-[state=checked]:border-2 data-[state=checked]:border-primary",
        "focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
        "aria-invalid:border-2 aria-invalid:border-destructive",
        "disabled:cursor-not-allowed disabled:border-muted-foreground disabled:bg-muted",
        className
      )}
      {...props}
    >
      <RadioGroupPrimitive.Indicator
        data-slot="radio-group-indicator"
        className="size-2.5 rounded-full bg-primary group-disabled/radio:bg-muted-foreground"
      />
    </RadioGroupPrimitive.Item>
  )
}

export { RadioGroup, RadioGroupItem }
