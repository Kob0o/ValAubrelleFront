import type { SVGProps } from "react";

type PictogramProps = SVGProps<SVGSVGElement> & {
  title?: string;
};

export function Pictogram({ title, ...props }: PictogramProps) {
  const clipId = "val-aubrelle-pictogram";

  return (
    <svg
      viewBox="0 0 64 64"
      width={40}
      height={40}
      role={title ? "img" : undefined}
      aria-hidden={title ? undefined : true}
      data-testid="pictogram"
      {...props}
    >
      {title ? <title>{title}</title> : null}
      <defs>
        <clipPath id={clipId}>
          <circle cx="32" cy="32" r="32" />
        </clipPath>
      </defs>
      <g clipPath={`url(#${clipId})`}>
        <rect width="64" height="64" fill="#2E7D5B" />
        <path fill="#8CC63F" d="M-1 42C15 33 49 33 65 42V66H-1Z" />
        <path fill="#1F5C42" d="M-1 55C16 49 48 49 65 55V66H-1Z" />
      </g>
    </svg>
  );
}
