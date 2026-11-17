"use client";

import * as React from "react";

import { Tooltip } from "@/components/shared/tooltip";
import { Button, type ButtonProps } from "@/components/ui/button";

type IconButtonProps = Omit<ButtonProps, "children" | "aria-label" | "size"> & {
  label: string;
  /** Affiche aussi le libellé en info-bulle (survol, focus, toucher). */
  tooltip?: boolean;
  children: React.ReactNode;
};

function IconButton({
  label,
  tooltip = false,
  children,
  variant = "ghost",
  ...props
}: IconButtonProps) {
  const button = (
    <Button
      type="button"
      variant={variant}
      size="icon"
      aria-label={label}
      {...props}
    >
      {children}
    </Button>
  );

  return tooltip ? <Tooltip content={label}>{button}</Tooltip> : button;
}

export { IconButton };
export type { IconButtonProps };
