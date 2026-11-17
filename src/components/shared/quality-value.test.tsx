import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeAll, describe, expect, it, vi } from "vitest";

import { QualityValue } from "@/components/shared/quality-value";
import { mockIndicatorValuesByQuality } from "@/mocks/quality-status";
import { charter } from "@/theme/tokens";
import { contrastRatio, TEXT_CONTRAST_MINIMUM } from "@/theme/contrast";
import { axeViolations } from "@/test/axe";
import { QUALITY_STATUSES } from "@/types/domain";

const unavailableStatuses = QUALITY_STATUSES.filter((status) => status !== "available");

// Radix positionne l'info-bulle avec ResizeObserver, absent de jsdom.
beforeAll(() => {
  globalThis.ResizeObserver ??= class {
    observe() {}
    unobserve() {}
    disconnect() {}
  };
});

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

describe("QualityValue", () => {
  it("formate une valeur disponible en fr-FR avec son unité", () => {
    render(<QualityValue value={mockIndicatorValuesByQuality.available} unit="€/m²" />);
    const value = screen.getByText(/€\/m²/);
    expect(value.textContent).toMatch(/^1[  ]980 €\/m²$/);
    expect(value).toHaveClass("tabular-nums");
  });

  it.each(unavailableStatuses.flatMap((status) => [
    { status, variant: "compact" as const },
    { status, variant: "detailed" as const },
  ]))("$status ($variant) n'affiche jamais « 0 »", ({ status, variant }) => {
    const { container } = render(
      <QualityValue value={mockIndicatorValuesByQuality[status]} variant={variant} />,
    );
    expect(container.textContent).not.toContain("0");
    expect(container.textContent?.trim()).not.toBe("—");
    expect(container.querySelector("svg")).toHaveAttribute("aria-hidden", "true");
  });

  it("donne un libellé distinct à chaque statut non disponible", () => {
    const labels = unavailableStatuses.map((status) => {
      render(<QualityValue value={mockIndicatorValuesByQuality[status]} />);
      const label = screen.getByRole("button").textContent;
      cleanup();
      return label;
    });
    expect(new Set(labels).size).toBe(unavailableStatuses.length);
  });

  it("expose le statut et sa raison au lecteur d'écran en compact", () => {
    render(<QualityValue value={mockIndicatorValuesByQuality.suppressed} />);
    expect(
      screen.getByRole("button", { name: /^Non diffusable\s*, secret statistique$/ }),
    ).toBeInTheDocument();
  });

  it("ouvre l'explication au focus et la ferme avec Échap", async () => {
    const user = userEvent.setup();
    render(<QualityValue value={mockIndicatorValuesByQuality.suppressed} />);

    await user.tab();
    expect(await screen.findByRole("tooltip")).toHaveTextContent(/secret statistique/);

    await user.keyboard("{Escape}");
    expect(screen.queryByRole("tooltip")).not.toBeInTheDocument();
  });

  it("affiche l'explication en texte et le lien en detailed", () => {
    render(
      <QualityValue
        value={mockIndicatorValuesByQuality.insufficient_sample}
        variant="detailed"
        explanationHref="/diffusion"
      />,
    );
    expect(screen.getByText("Échantillon insuffisant")).toBeInTheDocument();
    expect(screen.getByText(/Trop peu d'observations/)).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: "En savoir plus : Échantillon insuffisant" }),
    ).toHaveAttribute("href", "/diffusion");
  });

  it("rend « Donnée absente » et avertit si available arrive avec null", () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    const { container } = render(
      <QualityValue value={{ value: null, status: "available" }} />,
    );
    expect(screen.getByText("Donnée absente")).toBeInTheDocument();
    expect(container.textContent).not.toContain("0");
    expect(warn).toHaveBeenCalledOnce();
  });

  it("ne présente aucune violation axe sur les 6 statuts et 2 variantes", async () => {
    const { container } = render(
      <div>
        {QUALITY_STATUSES.flatMap((status) => [
          <QualityValue key={`${status}-c`} value={mockIndicatorValuesByQuality[status]} />,
          <QualityValue
            key={`${status}-d`}
            value={mockIndicatorValuesByQuality[status]}
            variant="detailed"
          />,
        ])}
      </div>,
    );
    expect(await axeViolations(container)).toEqual([]);
  });

  it("garde un contraste ≥ 4,5:1 en Anthracite et Gris ardoise sur blanc et Brume", () => {
    for (const color of [charter.text, charter.textMuted]) {
      for (const background of [charter.surface, charter.surfaceAlt]) {
        expect(contrastRatio(color, background)).toBeGreaterThanOrEqual(
          TEXT_CONTRAST_MINIMUM,
        );
      }
    }
  });
});
