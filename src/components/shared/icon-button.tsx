"use client";

import * as React from "react";

import { Button, type ButtonProps } from "@/components/ui/button";

type IconButtonProps = Omit<ButtonProps, "children" | "aria-label" | "size"> & {
  label: string;
  children: React.ReactNode;
};

function IconButton({
  label,
  children,
  variant = "ghost",
  ...props
}: IconButtonProps) {
  return (
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
}

export { IconButton };
export type { IconButtonProps };
