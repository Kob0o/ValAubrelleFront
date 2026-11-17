import * as React from "react";

import { Button, type ButtonProps } from "@/components/ui/button";

type IconButtonProps = Omit<ButtonProps, "children" | "aria-label" | "size"> & {
  label: string;
  tooltip?: string;
  children: React.ReactNode;
};

function IconButton({
  label,
  tooltip: _tooltip,
  children,
  variant = "ghost",
  ...props
}: IconButtonProps) {
  void _tooltip;

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
