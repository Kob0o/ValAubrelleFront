"use client";

import * as React from "react";

import {
  Tabs as TabsRoot,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { cn } from "@/lib/utils";

type TabItem = {
  value: string;
  label: string;
  content: React.ReactNode;
  disabled?: boolean;
};

type TabsProps = {
  items: TabItem[];
  /** Nom accessible de la liste d'onglets. */
  label: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  /** Garde l'onglet dans l'URL (`?onglet=`) pour le retrouver au rechargement. */
  syncWithUrl?: boolean;
  urlParam?: string;
  className?: string;
};

function subscribeToHistory(onChange: () => void) {
  window.addEventListener("popstate", onChange);
  return () => window.removeEventListener("popstate", onChange);
}

function isSelectable(items: TabItem[], value: string | null) {
  return items.some((item) => item.value === value && !item.disabled);
}

/**
 * Onglets Radix : flèches gauche / droite, Début / Fin, Tab entre dans le
 * panneau. L'onglet actif a un trait épais et la graisse SemiBold.
 */
function Tabs({
  items,
  label,
  defaultValue,
  onValueChange,
  syncWithUrl = false,
  urlParam = "onglet",
  className,
}: TabsProps) {
  const fallback =
    defaultValue ?? items.find((item) => !item.disabled)?.value ?? "";
  const [selected, setSelected] = React.useState<string | null>(null);
  // Le rendu serveur garde l'onglet par défaut ; l'URL est lue côté client.
  const fromUrl = React.useSyncExternalStore(
    subscribeToHistory,
    () =>
      syncWithUrl
        ? new URLSearchParams(window.location.search).get(urlParam)
        : null,
    () => null,
  );
  const value =
    selected ??
    (fromUrl !== null && isSelectable(items, fromUrl) ? fromUrl : fallback);

  function handleChange(next: string) {
    setSelected(next);
    onValueChange?.(next);
    if (syncWithUrl) {
      const url = new URL(window.location.href);
      url.searchParams.set(urlParam, next);
      // replaceState est intégré au routeur Next.js : pas de rechargement.
      window.history.replaceState(window.history.state, "", url);
    }
  }

  return (
    <TabsRoot
      value={value}
      onValueChange={handleChange}
      className={cn("gap-4", className)}
    >
      <div className="max-w-full overflow-x-auto border-b border-border">
        <TabsList
          variant="line"
          aria-label={label}
          className="h-auto w-max gap-1 p-0 group-data-horizontal/tabs:h-auto"
        >
          {items.map((item) => (
            <TabsTrigger
              key={item.value}
              value={item.value}
              disabled={item.disabled}
              className={cn(
                "min-h-11 flex-none rounded-none px-4 text-base font-normal text-foreground transition-[color,background-color] hover:bg-muted",
                "data-active:font-semibold data-active:text-foreground",
                "after:bg-primary group-data-horizontal/tabs:after:bottom-0 group-data-horizontal/tabs:after:h-1",
                "focus-visible:ring-0 focus-visible:outline-3 focus-visible:-outline-offset-3 focus-visible:outline-[color:var(--color-primary-strong)]",
              )}
            >
              {item.label}
            </TabsTrigger>
          ))}
        </TabsList>
      </div>
      {items.map((item) => (
        <TabsContent
          key={item.value}
          value={item.value}
          className="text-base focus-visible:outline-3 focus-visible:outline-offset-3 focus-visible:outline-[color:var(--color-primary-strong)]"
        >
          {item.content}
        </TabsContent>
      ))}
    </TabsRoot>
  );
}

export { Tabs };
export type { TabItem, TabsProps };
