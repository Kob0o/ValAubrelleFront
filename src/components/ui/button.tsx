import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { Loader2 } from "lucide-react";
import { Slot } from "radix-ui";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "group/button inline-flex shrink-0 items-center justify-center gap-2 rounded-lg border border-transparent bg-clip-padding text-base font-semibold whitespace-nowrap transition-[color,background-color,border-color,opacity,transform] outline-none select-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 active:not-aria-[haspopup]:translate-y-px disabled:pointer-events-none disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
  {
    variants: {
      variant: {
        default:
          "bg-primary text-primary-foreground hover:bg-[color-mix(in_srgb,var(--primary),#000_12%)]",
        secondary:
          "border-border bg-secondary text-secondary-foreground hover:bg-[color-mix(in_srgb,var(--secondary),var(--foreground)_6%)]",
        ghost:
          "bg-transparent text-foreground hover:bg-muted hover:text-foreground",
        destructive:
          "bg-destructive text-white hover:bg-[color-mix(in_srgb,var(--destructive),#000_12%)] focus-visible:border-destructive focus-visible:ring-destructive/30",
        link: "h-auto min-h-0 rounded-none border-0 bg-transparent px-0 text-primary underline underline-offset-4 hover:text-[color-mix(in_srgb,var(--primary),#000_16%)]",
      },
      size: {
        sm: "h-11 min-h-11 min-w-11 px-3 text-base",
        md: "h-11 min-h-11 min-w-11 px-4 text-base",
        lg: "h-11 min-h-11 min-w-11 px-6 text-base",
        icon: "size-11 min-h-11 min-w-11 p-0",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "md",
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
  variant = "default",
  size = "md",
  asChild = false,
  loading = false,
  disabled,
  children,
  onClick,
  ...props
}: ButtonProps) {
  const Comp = asChild ? Slot.Root : "button";
  const isDisabled = Boolean(disabled || loading);

  return (
    <Comp
      data-slot="button"
      data-variant={variant}
      data-size={size}
      data-loading={loading ? "true" : undefined}
      aria-busy={loading || undefined}
      disabled={asChild ? undefined : isDisabled}
      className={cn(buttonVariants({ variant, size, className }))}
      onClick={loading ? undefined : onClick}
      {...props}
    >
      {loading ? <Loader2 className="size-4 animate-spin" aria-hidden /> : null}
      {children}
    </Comp>
  );
}

export { Button, buttonVariants };
export type { ButtonProps };
