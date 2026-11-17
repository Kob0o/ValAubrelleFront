import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { BrandSignature } from "@/components/layout/brand-signature";

describe("BrandSignature", () => {
  it("affiche la signature imposée et un pictogramme non déformé", () => {
    render(<BrandSignature />);

    expect(
      screen.getByText(
        "Un service de la Communauté d'agglomération du Val d'Aubrelle",
      ),
    ).toBeInTheDocument();

    const logo = screen.getByRole("img", { name: "Val d’Aubrelle — Communauté d’agglomération" });
    expect(Number(logo.getAttribute("width"))).toBeGreaterThanOrEqual(120);
    expect(logo).toHaveAttribute("viewBox", "0 0 300 72");
    const mark = screen.getByTestId("pictogram");
    expect(mark).toHaveAttribute("width", "64");
    expect(mark).toHaveAttribute("height", "64");
  });
});
