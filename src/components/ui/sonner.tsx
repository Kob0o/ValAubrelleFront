"use client"

import { useTheme } from "next-themes"
import { Toaster as Sonner, type ToasterProps } from "sonner"
import { CircleCheckIcon, InfoIcon, TriangleAlertIcon, OctagonXIcon, Loader2Icon } from "lucide-react"

/**
 * Classes des toasts.
 * - Couleurs d'état de la charte (tokens) : bordure et icône seulement, le
 *   texte reste anthracite ; l'icône et le libellé portent le sens.
 * - Boutons : cibles de 44 px, texte 16 px SemiBold (charte, RGAA). Le `!`
 *   est nécessaire car les styles injectés par Sonner sont plus spécifiques.
 *   Le bouton de fermeture passe dans le coin haut droit, à l'intérieur du
 *   toast, qui réserve sa place (`pr-14`).
 */
export const toastClassNames = {
  toast: "cn-toast border-l-4 has-[[data-close-button]]:pr-14!",
  title: "text-base font-semibold",
  description: "text-base text-muted-foreground",
  closeButton:
    "size-11! top-1! right-1! left-auto! transform-none! rounded-md! focus-visible:outline-2! focus-visible:outline-offset-2! focus-visible:outline-[var(--color-primary-strong)]! [&_svg]:size-4",
  actionButton:
    "h-11! min-h-11! px-4! text-base! font-semibold! rounded-md! focus-visible:outline-2! focus-visible:outline-offset-2! focus-visible:outline-[var(--color-primary-strong)]!",
  success: "border-l-[var(--color-success)] [&_[data-icon]]:text-[var(--color-success)]",
  info: "border-l-[var(--color-info)] [&_[data-icon]]:text-[var(--color-info)]",
  warning: "border-l-[var(--color-warning)] [&_[data-icon]]:text-[var(--color-warning)]",
  error: "border-l-[var(--color-danger)] [&_[data-icon]]:text-[var(--color-danger)]",
} satisfies NonNullable<ToasterProps["toastOptions"]>["classNames"]

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = "system" } = useTheme()

  return (
    <Sonner
      theme={theme as ToasterProps["theme"]}
      className="toaster group"
      icons={{
        success: (
          <CircleCheckIcon className="size-4" />
        ),
        info: (
          <InfoIcon className="size-4" />
        ),
        warning: (
          <TriangleAlertIcon className="size-4" />
        ),
        error: (
          <OctagonXIcon className="size-4" />
        ),
        loading: (
          <Loader2Icon className="size-4 animate-spin" />
        ),
      }}
      style={
        {
          "--normal-bg": "var(--popover)",
          "--normal-text": "var(--popover-foreground)",
          "--normal-border": "var(--border)",
          "--border-radius": "var(--radius)",
        } as React.CSSProperties
      }
      containerAriaLabel="Notifications"
      toastOptions={{
        closeButtonAriaLabel: "Fermer la notification",
        classNames: toastClassNames,
      }}
      {...props}
    />
  )
}

export { Toaster }
