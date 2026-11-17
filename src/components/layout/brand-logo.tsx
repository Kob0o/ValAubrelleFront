import { Pictogram } from "./pictogram";
import { charter } from "@/theme/tokens";

type BrandLogoProps = { variant?: "default" | "on-dark" };

/** Composition vectorielle selon le PDF : proportions fixes et zone protégée H/2. */
export function BrandLogo({ variant = "default" }: BrandLogoProps) {
  const onDark = variant === "on-dark";
  const width = 176;
  const markHeight = width * 64 / 300;
  return (
    <span data-brand-logo="" style={{ display: "inline-flex", padding: markHeight / 2, flexShrink: 0 }}>
      <svg width={width} height={width * 72 / 300} viewBox="0 0 300 72" role="img" aria-label="Val d’Aubrelle — Communauté d’agglomération" style={{ display: "block", fontFamily: "var(--font-inter), sans-serif" }}>
        <Pictogram x={0} y={4} width={64} height={64} variant={variant} />
        <text x="80" y="27" fill={onDark ? charter.surface : charter.primaryStrong} fontSize="27" fontWeight="800">Val d’Aubrelle</text>
        <text x="80" y="47" fill={onDark ? charter.surface : charter.textMuted} fontSize="16" fontWeight="400" letterSpacing=".7">COMMUNAUTÉ</text>
        <text x="80" y="65" fill={onDark ? charter.surface : charter.textMuted} fontSize="16" fontWeight="400" letterSpacing=".7">D’AGGLOMÉRATION</text>
      </svg>
    </span>
  );
}
