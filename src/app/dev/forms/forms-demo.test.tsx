import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { FormsDemo } from "@/app/dev/forms/forms-demo";
import { axeViolations } from "@/test/axe";

describe("/dev/forms", () => {
  it("montre une section par composant de saisie et de choix", () => {
    render(<FormsDemo />);
    for (const name of [
      "TextField",
      "Select",
      "PasswordField",
      "TextArea",
      "RadioGroup",
      "Checkbox",
      "Toggle",
    ]) {
      expect(screen.getByRole("heading", { level: 2, name })).toBeInTheDocument();
    }
  });

  it("n'a aucune erreur axe", async () => {
    const { container } = render(<FormsDemo />);
    expect(await axeViolations(container)).toEqual([]);
  }, 30_000);
});
