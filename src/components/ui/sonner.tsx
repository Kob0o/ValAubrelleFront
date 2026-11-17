"use client"

import { useTheme } from "next-themes"
import { Toaster as Sonner, type ToasterProps } from "sonner"
import { CircleCheckIcon, InfoIcon, TriangleAlertIcon, OctagonXIcon, Loader2Icon } from "lucide-react"

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
        // Couleurs d'état de la charte (tokens) : bordure et icône seulement,
        // le texte reste anthracite ; l'icône et le libellé portent le sens.
        classNames: {
          toast: "cn-toast border-l-4",
          title: "text-base font-semibold",
          description: "text-base text-muted-foreground",
          success: "border-l-[var(--color-success)] [&_[data-icon]]:text-[var(--color-success)]",
          info: "border-l-[var(--color-info)] [&_[data-icon]]:text-[var(--color-info)]",
          warning: "border-l-[var(--color-warning)] [&_[data-icon]]:text-[var(--color-warning)]",
          error: "border-l-[var(--color-danger)] [&_[data-icon]]:text-[var(--color-danger)]",
        },
      }}
      {...props}
    />
  )
}

export { Toaster }
