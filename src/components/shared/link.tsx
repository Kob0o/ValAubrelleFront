import * as React from "react";
import NextLink from "next/link";
import { ExternalLink } from "lucide-react";

import { cn } from "@/lib/utils";

function isExternalHref(href: string) {
  return /^https?:\/\//i.test(href);
}

type AppLinkProps = Omit<React.ComponentProps<typeof NextLink>, "href"> & {
  href: string;
};

function Link({
  href,
  className,
  children,
  target,
  rel,
  ...props
}: AppLinkProps) {
  const external = isExternalHref(href);
  const opensNewWindow = target === "_blank";
  const resolvedRel = opensNewWindow
    ? [rel, "noopener", "noreferrer"].filter(Boolean).join(" ")
    : rel;

  const classes = cn(
    "inline-flex items-center gap-1 font-normal text-primary underline underline-offset-4 transition-[color,opacity] hover:text-[color-mix(in_srgb,var(--primary),#000_16%)] focus-visible:rounded-sm visited:text-[color-mix(in_srgb,var(--primary),#000_28%)]",
    className,
  );

  if (external) {
    return (
      <a
        href={href}
        target={target}
        rel={resolvedRel}
        data-external="true"
        className={classes}
        {...props}
      >
        {children}
        <ExternalLink className="size-4 shrink-0" aria-hidden />
        {opensNewWindow ? (
          <span className="sr-only"> (nouvelle fenêtre)</span>
        ) : null}
      </a>
    );
  }

  return (
    <NextLink
      href={href}
      target={target}
      rel={resolvedRel}
      className={classes}
      {...props}
    >
      {children}
    </NextLink>
  );
}

export { Link, isExternalHref };
export type { AppLinkProps };
