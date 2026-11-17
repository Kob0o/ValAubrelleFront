import type { ComponentProps } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

function NativeSelect({ className, children, ...props }: ComponentProps<"select">) {
  return (
    <span data-slot="native-select-wrapper" className="relative inline-flex min-w-0">
      <select
        data-slot="native-select"
        className={cn(
          "h-11 min-w-0 w-full appearance-none rounded-md border border-input bg-background py-2 pr-10 pl-3 text-base text-foreground outline-none transition-[border-color,box-shadow] focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:bg-muted disabled:text-muted-foreground aria-invalid:border-destructive motion-reduce:transition-none",
          className,
        )}
        {...props}
      >
        {children}
      </select>
      <ChevronDown aria-hidden="true" className="pointer-events-none absolute top-1/2 right-3 size-4 -translate-y-1/2 text-muted-foreground" />
    </span>
  );
}

export { NativeSelect };
