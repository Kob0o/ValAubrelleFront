import { BrandLogo } from "@/components/layout/brand-logo";

const SIGNATURE =
  "Un service de la Communauté d'agglomération du Val d'Aubrelle";

export function BrandSignature() {
  return (
    <div className="flex flex-wrap items-center gap-x-5 gap-y-2">
      <BrandLogo />
      <p className="max-w-sm text-base font-normal text-[var(--color-text)]">
        {SIGNATURE}
      </p>
    </div>
  );
}
