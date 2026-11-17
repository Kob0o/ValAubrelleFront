import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { BrandLogo } from "./brand-logo";
import { charter } from "@/theme/tokens";

afterEach(cleanup);

describe("logo selon la charte PDF", () => {
  it("respecte la largeur minimale et la zone de protection H/2", () => {
    const { container } = render(<BrandLogo />);
    const logo = screen.getByRole("img");
    const width = Number(logo.getAttribute("width"));
    const protectedZone = container.querySelector<HTMLElement>("[data-brand-logo]")!;
    expect(width).toBeGreaterThanOrEqual(120);
    expect(parseFloat(protectedZone.style.padding)).toBeGreaterThanOrEqual(width * 64 / 300 / 2);
    expect(Number(logo.getAttribute("height")) / width).toBeCloseTo(72 / 300);
  });

  it("applique la version fond foncé prescrite plutôt que le pictogramme vert", () => {
    const { container } = render(<BrandLogo variant="on-dark" />);
    expect(container.querySelector('[data-testid="pictogram"] rect')).toHaveAttribute("fill", charter.surface);
    expect(container.querySelector('[data-testid="pictogram"] path:last-child')).toHaveAttribute("fill", charter.primary);
    expect(container.querySelector("text")).toHaveAttribute("fill", charter.surface);
  });

  it("isole les découpes des logos clair et foncé affichés sur une même page", () => {
    const { container } = render(<><BrandLogo /><BrandLogo variant="on-dark" /></>);
    const ids = Array.from(container.querySelectorAll("clipPath"), (path) => path.id);
    expect(new Set(ids).size).toBe(2);
  });
});
