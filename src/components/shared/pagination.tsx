"use client";

import * as React from "react";
import { ChevronLeftIcon, ChevronRightIcon } from "lucide-react";

import { IconButton } from "@/components/shared/icon-button";
import { Button } from "@/components/ui/button";
import {
  Pagination as PaginationRoot,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
} from "@/components/ui/pagination";
import { cn } from "@/lib/utils";
import type { Page } from "@/types/domain";

export const DEFAULT_PAGE_SIZES = [20, 50, 100] as const;

export function getPageCount(total: number, size: number) {
  return Math.max(1, Math.ceil(total / size));
}

/** Pages affichées : 1 … 4 5 6 … 12 au-delà de 7 pages. */
export function getPageItems(page: number, pageCount: number) {
  if (pageCount <= 7) {
    return Array.from({ length: pageCount }, (_, index) => index + 1);
  }
  const start = Math.max(2, Math.min(page - 1, pageCount - 4));
  const end = Math.min(pageCount - 1, Math.max(page + 1, 5));
  const items: (number | "ellipsis")[] = [1];
  if (start > 2) items.push("ellipsis");
  for (let current = start; current <= end; current += 1) items.push(current);
  if (end < pageCount - 1) items.push("ellipsis");
  items.push(pageCount);
  return items;
}

const resultFormat = new Intl.NumberFormat("fr-FR");

type PaginationProps = Pick<Page<unknown>, "page" | "size" | "total"> & {
  onPageChange: (page: number) => void;
  onSizeChange?: (size: number) => void;
  sizes?: readonly number[];
  loading?: boolean;
  /**
   * Titre ou tableau de la liste (avec `tabIndex={-1}`), focalisé après un
   * changement : le bouton activé peut devenir désactivé ou disparaître.
   */
  focusTargetRef: React.RefObject<HTMLElement | null>;
  className?: string;
};

/**
 * Pagination d'une liste `Page`. La synchronisation avec l'URL
 * (`?page=&size=`) reste au parent.
 */
function Pagination({
  page,
  size,
  total,
  onPageChange,
  onSizeChange,
  sizes = DEFAULT_PAGE_SIZES,
  loading = false,
  focusTargetRef,
  className,
}: PaginationProps) {
  const pageCount = getPageCount(total, size);
  const sizeSelectId = React.useId();

  React.useEffect(() => {
    if (page > pageCount) onPageChange(pageCount);
  }, [page, pageCount, onPageChange]);

  if (total <= size) return null;

  const currentPage = Math.min(Math.max(page, 1), pageCount);

  function goTo(target: number) {
    if (loading || target === currentPage) return;
    onPageChange(target);
    focusTargetRef.current?.focus();
  }

  const results = `${resultFormat.format(total)} résultat${total > 1 ? "s" : ""}`;

  return (
    <PaginationRoot
      aria-busy={loading || undefined}
      className={cn("flex-col items-center gap-3 sm:flex-row sm:justify-between", className)}
    >
      <p aria-live="polite" className="text-base text-foreground">
        Page {currentPage} sur {pageCount} · {results}
      </p>

      <PaginationContent className="gap-1">
        <PaginationItem>
          <IconButton
            label="Page précédente"
            variant="outline"
            disabled={loading || currentPage === 1}
            onClick={() => goTo(currentPage - 1)}
          >
            <ChevronLeftIcon aria-hidden />
          </IconButton>
        </PaginationItem>

        {getPageItems(currentPage, pageCount).map((item, index) =>
          item === "ellipsis" ? (
            <PaginationItem key={`ellipsis-${index}`} className="hidden sm:block">
              <PaginationEllipsis className="size-11" />
            </PaginationItem>
          ) : (
            <PaginationItem key={item} className="hidden sm:block">
              <Button
                variant={item === currentPage ? "outline" : "ghost"}
                size="icon"
                aria-label={`Page ${item}`}
                aria-current={item === currentPage ? "page" : undefined}
                disabled={loading}
                onClick={() => goTo(item)}
                className={cn(
                  "tabular-nums",
                  item === currentPage &&
                    "border-2 border-primary text-primary hover:text-primary",
                )}
              >
                {item}
              </Button>
            </PaginationItem>
          ),
        )}

        <PaginationItem
          aria-hidden
          className="px-2 text-base tabular-nums text-foreground sm:hidden"
        >
          {currentPage} / {pageCount}
        </PaginationItem>

        <PaginationItem>
          <IconButton
            label="Page suivante"
            variant="outline"
            disabled={loading || currentPage === pageCount}
            onClick={() => goTo(currentPage + 1)}
          >
            <ChevronRightIcon aria-hidden />
          </IconButton>
        </PaginationItem>
      </PaginationContent>

      {onSizeChange ? (
        <div className="flex items-center gap-2">
          <label htmlFor={sizeSelectId} className="text-base text-foreground">
            Résultats par page
          </label>
          <select
            id={sizeSelectId}
            value={size}
            disabled={loading}
            onChange={(event) => onSizeChange(Number(event.target.value))}
            className="min-h-11 rounded-lg border border-[color:var(--color-text-muted)] bg-background px-3 text-base text-foreground focus-visible:outline-3 focus-visible:outline-offset-3 focus-visible:outline-[color:var(--color-primary-strong)] disabled:opacity-50"
          >
            {sizes.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </div>
      ) : null}
    </PaginationRoot>
  );
}

export { Pagination };
export type { PaginationProps };
