import { useState } from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { Toggle, type ToggleProps } from "@/components/forms/toggle";
import { axeViolations } from "@/test/axe";

function ControlledToggle(props: Partial<ToggleProps>) {
  const [checked, setChecked] = useState(props.checked ?? false);
  return (
    <Toggle
      label="Compte actif"
      {...props}
      checked={checked}
      onChange={(next) => {
        setChecked(next);
        props.onChange?.(next);
      }}
    />
  );
}

describe("Toggle", () => {
  it("est un interrupteur avec libellé visible et état écrit", async () => {
    const user = userEvent.setup();
    render(<ControlledToggle />);

    const toggle = screen.getByRole("switch", { name: "Compte actif" });
    expect(toggle).toHaveAttribute("aria-checked", "false");
    expect(screen.getByText("Désactivé")).toBeVisible();

    await user.click(screen.getByText("Compte actif"));
    expect(toggle).toHaveAttribute("aria-checked", "true");
    expect(screen.getByText("Activé")).toBeVisible();
  });

  it("Espace bascule l'interrupteur au clavier", async () => {
    const user = userEvent.setup();
    render(<ControlledToggle />);

    await user.tab();
    const toggle = screen.getByRole("switch");
    expect(toggle).toHaveFocus();
    await user.keyboard(" ");
    expect(toggle).toHaveAttribute("aria-checked", "true");
  });

  it("en pending, ignore les clics et le clavier", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<ControlledToggle pending onChange={onChange} />);

    const toggle = screen.getByRole("switch");
    expect(toggle).toHaveAttribute("aria-busy", "true");
    expect(toggle).toHaveAttribute("aria-disabled", "true");
    expect(screen.getByText("Enregistrement…")).toBeVisible();

    await user.click(toggle);
    await user.click(screen.getByText("Compte actif"));
    toggle.focus();
    await user.keyboard(" ");

    expect(onChange).not.toHaveBeenCalled();
    expect(toggle).toHaveAttribute("aria-checked", "false");
  });

  it("en pending, garde le focus sur l'interrupteur", async () => {
    const user = userEvent.setup();
    const { rerender } = render(
      <Toggle label="Compte actif" checked={false} onChange={() => {}} />,
    );
    await user.tab();
    const toggle = screen.getByRole("switch");
    expect(toggle).toHaveFocus();

    rerender(<Toggle label="Compte actif" checked={false} onChange={() => {}} pending />);
    expect(toggle).toHaveFocus();
  });

  it("désactivé : non modifiable", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<ControlledToggle disabled onChange={onChange} />);

    const toggle = screen.getByRole("switch");
    expect(toggle).toBeDisabled();
    await user.click(toggle);
    expect(onChange).not.toHaveBeenCalled();
  });

  it("relie description et erreur", () => {
    render(
      <ControlledToggle
        description="Un compte inactif ne peut plus se connecter."
        error="Le changement n'a pas été enregistré."
      />,
    );
    expect(screen.getByRole("switch")).toHaveAccessibleDescription(
      "Un compte inactif ne peut plus se connecter. Erreur : Le changement n'a pas été enregistré.",
    );
  });

  it("n'a pas d'erreur axe", async () => {
    const { container } = render(
      <>
        <ControlledToggle description="Précision." />
        <ControlledToggle label="En attente" pending />
        <ControlledToggle label="En erreur" error="Échec de l'enregistrement." />
      </>,
    );
    expect(await axeViolations(container)).toEqual([]);
  });
});
