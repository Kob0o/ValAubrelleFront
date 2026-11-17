import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { StatusBadge, type StatusBadgeProps } from "@/components/shared/status-badge";
import {
  statusLabelsByKind,
  statusVisuals,
  type StatusKind,
  type StatusTone,
} from "@/components/shared/status-badge.config";
import { charter } from "@/theme/tokens";
import { contrastRatio, TEXT_CONTRAST_MINIMUM } from "@/theme/contrast";

const kinds = Object.keys(statusVisuals) as StatusKind[];
const allPairs = kinds.flatMap((kind) =>
  Object.keys(statusVisuals[kind]).map((status) => ({ kind, status })),
);

/** Couleurs réelles de toneClasses (status-badge.tsx). */
const toneColors: Record<StatusTone, { text: string; border: string }> = {
  neutral: { text: charter.text, border: charter.textMuted },
  info: { text: charter.info, border: charter.info },
  success: { text: charter.success, border: charter.success },
  warning: { text: charter.warning, border: charter.warning },
  danger: { text: charter.danger, border: charter.danger },
};

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

describe("StatusBadge", () => {
  it("couvre les 19 statuts du ticket", () => {
    expect(allPairs).toHaveLength(19);
  });

  it.each(allPairs)("$kind / $status a un libellé et une icône", ({ kind, status }) => {
    const label = (statusLabelsByKind[kind] as Record<string, string>)[status];
    expect(label).toBeTruthy();

    const { container } = render(
      <StatusBadge {...({ kind, status } as StatusBadgeProps)} />,
    );

    expect(screen.getByText(label)).toBeInTheDocument();
    const icon = container.querySelector("svg");
    expect(icon).not.toBeNull();
    expect(icon).toHaveAttribute("aria-hidden", "true");
  });

  it("le lecteur d'écran ne lit que le libellé", () => {
    const { container } = render(<StatusBadge kind="request" status="awaiting_details" />);
    expect(container.firstChild).toHaveTextContent(/^En attente de précisions$/);
  });

  it("affiche un badge neutre pour un statut inconnu, sans planter", () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    const { container } = render(
      <StatusBadge {...({ kind: "report", status: "archived" } as unknown as StatusBadgeProps)} />,
    );

    expect(screen.getByText("Statut inconnu")).toBeInTheDocument();
    expect(container.firstChild).toHaveAttribute("data-tone", "neutral");
    expect(warn).toHaveBeenCalledOnce();
  });

  it("n'avertit pas de nouveau à chaque re-rendu", () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    const props = { kind: "report", status: "archived" } as unknown as StatusBadgeProps;
    const { rerender } = render(<StatusBadge {...props} />);
    rerender(<StatusBadge {...props} size="compact" />);
    expect(warn).toHaveBeenCalledOnce();
  });

  it("n'accepte pas une clé héritée de Object comme statut", () => {
    vi.spyOn(console, "warn").mockImplementation(() => {});
    render(
      <StatusBadge {...({ kind: "account", status: "toString" } as unknown as StatusBadgeProps)} />,
    );
    expect(screen.getByText("Statut inconnu")).toBeInTheDocument();
  });

  it("applique la taille compacte (14 px) et standard (16 px)", () => {
    const { container, rerender } = render(
      <StatusBadge kind="account" status="active" size="compact" />,
    );
    expect(container.firstChild).toHaveClass("text-sm", "font-semibold");

    rerender(<StatusBadge kind="account" status="active" />);
    expect(container.firstChild).toHaveClass("text-base", "font-semibold");
  });

  it.each(Object.entries(toneColors))(
    "ton %s : texte ≥ 4,5:1 et contour ≥ 3:1 sur fond blanc",
    (_tone, { text, border }) => {
      expect(contrastRatio(text, charter.surface)).toBeGreaterThanOrEqual(
        TEXT_CONTRAST_MINIMUM,
      );
      expect(contrastRatio(border, charter.surface)).toBeGreaterThanOrEqual(3);
      expect(text).not.toBe(charter.accent);
    },
  );
});
