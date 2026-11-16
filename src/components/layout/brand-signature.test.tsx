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

    const mark = screen.getByTestId("pictogram");
    expect(mark).toHaveAttribute("width", "40");
    expect(mark).toHaveAttribute("height", "40");
  });
});
