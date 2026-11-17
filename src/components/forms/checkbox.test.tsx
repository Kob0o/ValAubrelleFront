import { useState } from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import {
  Checkbox,
  type CheckboxProps,
  type CheckboxState,
} from "@/components/forms/checkbox";
import { axeViolations } from "@/test/axe";

function ControlledCheckbox(
  props: Partial<CheckboxProps> & { initial?: CheckboxState },
) {
  const [checked, setChecked] = useState<CheckboxState>(props.initial ?? false);
  return (
    <Checkbox
      label="Recevoir les notifications"
      {...props}
      checked={checked}
      onChange={(next) => {
        setChecked(next);
        props.onChange?.(next);
      }}
    />
  );
}

describe("Checkbox", () => {
  it("coche et décoche au clic sur le libellé", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<ControlledCheckbox onChange={onChange} />);

    const checkbox = screen.getByRole("checkbox", { name: "Recevoir les notifications" });
    expect(checkbox).not.toBeChecked();

    await user.click(screen.getByText("Recevoir les notifications"));
    expect(checkbox).toBeChecked();
    expect(onChange).toHaveBeenLastCalledWith(true);

    await user.click(screen.getByText("Recevoir les notifications"));
    expect(checkbox).not.toBeChecked();
    expect(onChange).toHaveBeenLastCalledWith(false);
  });

  it("Espace coche la case au clavier", async () => {
    const user = userEvent.setup();
    render(<ControlledCheckbox />);

    await user.tab();
    const checkbox = screen.getByRole("checkbox");
    expect(checkbox).toHaveFocus();
    await user.keyboard(" ");
    expect(checkbox).toBeChecked();
  });

  it("annonce l'état indéterminé (aria-checked=mixed), puis coche", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<ControlledCheckbox initial="indeterminate" onChange={onChange} />);

    const checkbox = screen.getByRole("checkbox");
    expect(checkbox).toHaveAttribute("aria-checked", "mixed");
    expect(checkbox).toBePartiallyChecked();

    await user.click(checkbox);
    expect(onChange).toHaveBeenLastCalledWith(true);
    expect(checkbox).toHaveAttribute("aria-checked", "true");
  });

  it("affiche une coche ou un tiret visible, pas la couleur seule", () => {
    const { rerender } = render(
      <Checkbox label="Case" checked onChange={() => {}} />,
    );
    expect(document.querySelector("[data-slot=checkbox-indicator] svg")).not.toBeNull();

    rerender(<Checkbox label="Case" checked="indeterminate" onChange={() => {}} />);
    expect(screen.getByRole("checkbox")).toHaveAttribute("data-state", "indeterminate");
    expect(document.querySelector("[data-slot=checkbox-indicator] svg")).not.toBeNull();
  });

  it("offre une ligne cliquable d'au moins 44 px", () => {
    render(<ControlledCheckbox />);
    expect(
      screen.getByText("Recevoir les notifications").closest(".min-h-11"),
    ).not.toBeNull();
  });

  it("place le badge Obligatoire sur la ligne du libellé", () => {
    render(<ControlledCheckbox required />);

    const label = screen.getByText("Recevoir les notifications");
    const badge = screen.getByText("Obligatoire");
    expect(badge.parentElement).toBe(label.parentElement);
    expect(label.parentElement).toHaveClass("flex", "flex-wrap", "items-center");
  });

  it("relie description et erreur", () => {
    render(
      <ControlledCheckbox
        description="Un e-mail à chaque nouvelle demande."
        error="Acceptez les conditions pour continuer."
        required
      />,
    );

    const checkbox = screen.getByRole("checkbox");
    expect(checkbox).toHaveAttribute("aria-invalid", "true");
    expect(checkbox).toHaveAttribute("aria-required", "true");
    expect(checkbox).toHaveAccessibleDescription(
      "Un e-mail à chaque nouvelle demande. Erreur : Acceptez les conditions pour continuer.",
    );
  });

  it("désactivée : pas de changement au clic", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<ControlledCheckbox disabled onChange={onChange} />);

    const checkbox = screen.getByRole("checkbox");
    expect(checkbox).toBeDisabled();
    await user.click(checkbox);
    expect(onChange).not.toHaveBeenCalled();
  });

  it("n'a pas d'erreur axe", async () => {
    const { container } = render(
      <ControlledCheckbox
        initial="indeterminate"
        description="Précision."
        error="Erreur."
        required
      />,
    );
    expect(await axeViolations(container)).toEqual([]);
  });
});
