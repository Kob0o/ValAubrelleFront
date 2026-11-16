import { Pictogram } from "@/components/layout/pictogram";

const SIGNATURE =
  "Un service de la Communauté d'agglomération du Val d'Aubrelle";

export function BrandSignature() {
  return (
    <p className="inline-flex min-w-[120px] items-center gap-5">
      <Pictogram className="size-10 shrink-0" width={40} height={40} />
      <span className="text-base font-normal text-[var(--color-text)]">
        {SIGNATURE}
      </span>
    </p>
  );
}
