import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { Link } from "@/components/shared/link";

describe("Link", () => {
  it("ajoute rel et la mention nouvelle fenêtre pour un lien externe", () => {
    render(
      <Link href="https://example.com" target="_blank">
        Documentation
      </Link>,
    );

    const link = screen.getByRole("link", {
      name: /Documentation \(nouvelle fenêtre\)/,
    });
    expect(link).toHaveAttribute("rel", "noopener noreferrer");
    expect(link).toHaveAttribute("data-external", "true");
  });

  it("rend un lien interne sans mention nouvelle fenêtre", () => {
    render(<Link href="/communes">Communes</Link>);

    const link = screen.getByRole("link", { name: "Communes" });
    expect(link).not.toHaveAttribute("data-external");
    expect(link).not.toHaveTextContent("nouvelle fenêtre");
  });
});
