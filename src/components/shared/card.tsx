import * as React from "react";
import { Check } from "lucide-react";

import {
  Card as UiCard,
  CardContent as UiCardContent,
  CardFooter as UiCardFooter,
  CardHeader as UiCardHeader,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";

type CardVariant = "standard" | "interactive";

type CardSelectionContextValue = {
  selected: boolean;
};

const CardSelectionContext = React.createContext<CardSelectionContextValue>({
  selected: false,
});

type CardProps = React.ComponentProps<typeof UiCard> & {
  variant?: CardVariant;
  selected?: boolean;
  selectedLabel?: string;
};

function Card({
  className,
  variant = "standard",
  selected = false,
  selectedLabel = "Sélectionnée",
  children,
  ...props
}: CardProps) {
  const isInteractive = variant === "interactive";

  return (
    <CardSelectionContext.Provider value={{ selected }}>
      <UiCard
        data-variant={variant}
        data-selected={selected ? "true" : undefined}
        className={cn(
          "relative bg-card text-card-foreground",
          isInteractive &&
            "overflow-visible transition-[box-shadow,border-color] hover:ring-2 hover:ring-primary/40 has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-[color:var(--color-primary-strong)]",
          selected && "ring-2 ring-primary",
          className,
        )}
        {...props}
      >
        {selected ? (
          <span className="absolute top-3 right-3 z-20 inline-flex items-center gap-1 rounded-md bg-primary px-2 py-1 text-sm font-semibold text-primary-foreground">
            <Check className="size-4" aria-hidden />
            {selectedLabel}
          </span>
        ) : null}
        {children}
      </UiCard>
    </CardSelectionContext.Provider>
  );
}

function CardHeader({
  className,
  ...props
}: React.ComponentProps<typeof UiCardHeader>) {
  return <UiCardHeader className={className} {...props} />;
}

type CardTitleProps = Omit<React.ComponentProps<"h2">, "as"> & {
  as?: "h2" | "h3" | "h4";
};

function CardTitle({ as: Comp = "h3", className, ...props }: CardTitleProps) {
  return (
    <Comp
      data-slot="card-title"
      className={cn(
        "font-heading text-base leading-snug font-semibold text-[color:var(--color-primary-strong)]",
        className,
      )}
      {...props}
    />
  );
}

function CardContent({
  className,
  ...props
}: React.ComponentProps<typeof UiCardContent>) {
  return <UiCardContent className={className} {...props} />;
}

function CardFooter({
  className,
  ...props
}: React.ComponentProps<typeof UiCardFooter>) {
  return <UiCardFooter className={className} {...props} />;
}

type InteractiveCardActionProps = React.ComponentProps<"a"> & {
  asChild?: boolean;
};

function InteractiveCardAction({
  className,
  children,
  asChild = false,
  ...props
}: InteractiveCardActionProps) {
  const { selected } = React.useContext(CardSelectionContext);
  const selectionProps = {
    "aria-current": selected ? ("true" as const) : undefined,
  };

  if (asChild && React.isValidElement(children)) {
    return React.cloneElement(
      children as React.ReactElement<{
        className?: string;
        "aria-current"?: string;
      }>,
      {
        className: cn(
          "absolute inset-0 z-10 rounded-[inherit] focus-visible:outline-none",
          (children as React.ReactElement<{ className?: string }>).props
            .className,
          className,
        ),
        ...selectionProps,
      },
    );
  }

  return (
    <a
      className={cn(
        "absolute inset-0 z-10 rounded-[inherit] focus-visible:outline-none",
        className,
      )}
      {...selectionProps}
      {...props}
    >
      <span className="sr-only">{children}</span>
    </a>
  );
}

export {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
  InteractiveCardAction,
};
export type { CardProps, CardVariant, CardTitleProps };
