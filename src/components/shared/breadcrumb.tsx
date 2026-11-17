"use client";

import * as React from "react";
import { flushSync } from "react-dom";
import { MoreHorizontalIcon } from "lucide-react";

import { Link } from "@/components/shared/link";
import {
  Breadcrumb as BreadcrumbRoot,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { cn } from "@/lib/utils";

type BreadcrumbEntry = { label: string; href: string };

type BreadcrumbProps = {
  /** Niveaux parents, du plus haut au plus proche. */
  items: BreadcrumbEntry[];
  /** Page courante, non cliquable. */
  current: string;
  className?: string;
};

const separator = <BreadcrumbSeparator className="[&>svg]:size-4" />;

/**
 * Fil d'Ariane. À 390 px, seuls le premier niveau et la page courante restent
 * visibles ; les niveaux intermédiaires se déplient avec le bouton « … ».
 */
function Breadcrumb({ items, current, className }: BreadcrumbProps) {
  const [expanded, setExpanded] = React.useState(false);
  const firstHiddenRef = React.useRef<HTMLAnchorElement>(null);
  const [first, ...middle] = items;
  const collapsible = middle.length > 0;

  return (
    <BreadcrumbRoot className={className}>
      <BreadcrumbList className="gap-1 text-base text-foreground">
        {first ? (
          <>
            <BreadcrumbItem>
              <Link href={first.href} className="min-h-11 sm:min-h-0">
                {first.label}
              </Link>
            </BreadcrumbItem>
            {separator}
          </>
        ) : null}

        {collapsible && !expanded ? (
          <>
            <BreadcrumbItem className="sm:hidden">
              <button
                type="button"
                aria-label={`Afficher les ${middle.length} niveaux intermédiaires`}
                onClick={() => {
                  // Le bouton disparaît : le focus passe au premier niveau déplié.
                  flushSync(() => setExpanded(true));
                  firstHiddenRef.current?.focus();
                }}
                className="inline-flex size-11 items-center justify-center rounded-md hover:bg-muted focus-visible:outline-3 focus-visible:outline-offset-3 focus-visible:outline-[color:var(--color-primary-strong)]"
              >
                <MoreHorizontalIcon aria-hidden className="size-4" />
              </button>
            </BreadcrumbItem>
            <BreadcrumbSeparator className="sm:hidden [&>svg]:size-4" />
          </>
        ) : null}

        {middle.map((item, index) => (
          <React.Fragment key={item.href}>
            <BreadcrumbItem
              className={cn(!expanded && "hidden sm:inline-flex")}
            >
              <Link
                href={item.href}
                ref={index === 0 ? firstHiddenRef : undefined}
                className="min-h-11 sm:min-h-0"
              >
                {item.label}
              </Link>
            </BreadcrumbItem>
            <BreadcrumbSeparator
              className={cn("[&>svg]:size-4", !expanded && "hidden sm:inline")}
            />
          </React.Fragment>
        ))}

        <BreadcrumbItem>
          <BreadcrumbPage className="font-semibold text-foreground">
            {current}
          </BreadcrumbPage>
        </BreadcrumbItem>
      </BreadcrumbList>
    </BreadcrumbRoot>
  );
}

export { Breadcrumb };
export type { BreadcrumbEntry, BreadcrumbProps };
