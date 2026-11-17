import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { Button } from "@/components/ui/button";
import { contrastRatio, TEXT_CONTRAST_MINIMUM } from "@/theme/contrast";
import { charter } from "@/theme/tokens";

describe("Button", () => {
  it("n'appelle pas onClick en état loading", async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();

    render(
      <Button loading onClick={onClick}>
        Enregistrer
      </Button>,
    );

    const button = screen.getByRole("button", { name: "Enregistrer" });
    expect(button).toHaveAttribute("aria-busy", "true");
    expect(button).toBeDisabled();

    await user.click(button);
    expect(onClick).not.toHaveBeenCalled();
  });

  it("respecte le contraste de l'action principale", () => {
    expect(
      contrastRatio(charter.onPrimary, charter.primary),
    ).toBeGreaterThanOrEqual(TEXT_CONTRAST_MINIMUM);
  });

  it("respecte le contraste de l'action destructive", () => {
    expect(
      contrastRatio(charter.onPrimary, charter.danger),
    ).toBeGreaterThanOrEqual(TEXT_CONTRAST_MINIMUM);
  });
});
