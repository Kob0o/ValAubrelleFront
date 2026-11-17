"use client";

import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { Loader2 } from "lucide-react";
import { Slot } from "radix-ui";

import { cn } from "@/lib/utils";

const primaryClasses =
  "bg-primary text-primary-foreground hover:bg-[color-mix(in_srgb,var(--primary),#000_12%)]";
const destructiveClasses =
  "bg-destructive text-white hover:bg-[color-mix(in_srgb,var(--destructive),#000_12%)] focus-visible:border-destructive focus-visible:ring-destructive/30";
const sizeMdClasses = "h-11 min-h-11 min-w-11 px-4 text-base";
const sizeIconClasses = "size-11 min-h-11 min-w-11 p-0";

const buttonVariants = cva(
  "group/button inline-flex shrink-0 items-center justify-center gap-2 rounded-lg border border-transparent bg-clip-padding text-base font-semibold whitespace-nowrap transition-[color,background-color,border-color,opacity,transform] outline-none select-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 active:not-aria-[haspopup]:translate-y-px disabled:pointer-events-none disabled:opacity-50 aria-disabled:pointer-events-none aria-disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
  {
    variants: {
      variant: {
        primary: primaryClasses,
        default: primaryClasses,
        secondary:
          "border-border bg-secondary text-secondary-foreground hover:bg-[color-mix(in_srgb,var(--secondary),var(--foreground)_6%)]",
        ghost:
          "bg-transparent text-foreground hover:bg-muted hover:text-foreground",
        destructive: destructiveClasses,
        danger: destructiveClasses,
        outline:
          "border-border bg-background hover:bg-muted hover:text-foreground aria-expanded:bg-muted aria-expanded:text-foreground",
        link: "h-auto min-h-0 rounded-none border-0 bg-transparent px-0 text-primary underline underline-offset-4 hover:text-[color-mix(in_srgb,var(--primary),#000_16%)]",
      },
      size: {
        default: sizeMdClasses,
        md: sizeMdClasses,
        xs: "h-11 min-h-11 min-w-11 px-2.5 text-base",
        sm: "h-11 min-h-11 min-w-11 px-3 text-base",
        lg: "h-11 min-h-11 min-w-11 px-6 text-base",
        icon: sizeIconClasses,
        "icon-xs": sizeIconClasses,
        "icon-sm": sizeIconClasses,
        "icon-lg": sizeIconClasses,
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "default",
    },
  },
);

type ButtonProps = React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean;
    loading?: boolean;
  };

function Button({
  className,
  variant = "primary",
  size = "default",
  asChild = false,
  loading = false,
  disabled,
  children,
  onClick,
  ...props
}: ButtonProps) {
  const Comp = asChild ? Slot.Root : "button";
  const isDisabled = Boolean(disabled || loading);

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    if (isDisabled) {
      event.preventDefault();
      event.stopPropagation();
      return;
    }
    onClick?.(event);
  };

  return (
    <Comp
      data-slot="button"
      data-variant={variant}
      data-size={size}
      data-loading={loading ? "true" : undefined}
      aria-busy={loading || undefined}
      aria-disabled={asChild && isDisabled ? true : undefined}
      disabled={asChild ? undefined : isDisabled}
      className={cn(buttonVariants({ variant, size, className }))}
      onClick={handleClick}
      {...props}
    >
      {loading ? <Loader2 className="size-4 animate-spin" aria-hidden /> : null}
      {asChild ? <Slot.Slottable>{children}</Slot.Slottable> : children}
    </Comp>
  );
}

export { Button, buttonVariants };
export type { ButtonProps };
