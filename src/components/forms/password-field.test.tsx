import { useState } from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import {
  PasswordField,
  type PasswordFieldProps,
} from "@/components/forms/password-field";
import { axeViolations } from "@/test/axe";

function ControlledPassword(props: Partial<PasswordFieldProps>) {
  const [value, setValue] = useState(props.value ?? "");
  return (
    <PasswordField
      label="Mot de passe"
      name="password"
      {...props}
      value={value}
      onChange={(next) => {
        setValue(next);
        props.onChange?.(next);
      }}
    />
  );
}

const rules = [
  { id: "length", label: "12 caractères minimum", met: true },
  { id: "digit", label: "Au moins un chiffre", met: false },
];

describe("PasswordField", () => {
  it("bascule le type password / text avec le bouton œil", async () => {
    const user = userEvent.setup();
    render(<ControlledPassword value="secret" />);

    const input = screen.getByLabelText("Mot de passe");
    const toggle = screen.getByRole("button", { name: "Afficher le mot de passe" });
    expect(input).toHaveAttribute("type", "password");
    expect(toggle).toHaveAttribute("aria-pressed", "false");

    await user.click(toggle);
    expect(input).toHaveAttribute("type", "text");
    expect(toggle).toHaveAttribute("aria-pressed", "true");

    await user.click(toggle);
    expect(input).toHaveAttribute("type", "password");
    expect(toggle).toHaveAttribute("aria-pressed", "false");
  });

  it("le bouton œil fait 44 px et suit le champ au clavier", async () => {
    const user = userEvent.setup();
    render(<ControlledPassword />);

    const toggle = screen.getByRole("button", { name: "Afficher le mot de passe" });
    expect(toggle).toHaveClass("size-11");

    await user.tab();
    expect(screen.getByLabelText("Mot de passe")).toHaveFocus();
    await user.tab();
    expect(toggle).toHaveFocus();
    await user.keyboard(" ");
    expect(screen.getByLabelText("Mot de passe")).toHaveAttribute("type", "text");
  });

  it.each(["current-password", "new-password"] as const)(
    "pose autocomplete=%s",
    (autoComplete) => {
      render(<ControlledPassword autoComplete={autoComplete} />);
      expect(screen.getByLabelText("Mot de passe")).toHaveAttribute(
        "autocomplete",
        autoComplete,
      );
    },
  );

  it("utilise current-password par défaut", () => {
    render(<ControlledPassword />);
    expect(screen.getByLabelText("Mot de passe")).toHaveAttribute(
      "autocomplete",
      "current-password",
    );
  });

  it("affiche les règles avec icône et texte, reliées par aria-describedby", () => {
    render(<ControlledPassword rules={rules} />);

    expect(screen.getByText("12 caractères minimum : respectée")).toBeVisible();
    expect(screen.getByText("Au moins un chiffre : non respectée")).toBeVisible();
    expect(screen.getByLabelText("Mot de passe")).toHaveAccessibleDescription(
      "12 caractères minimum : respectée Au moins un chiffre : non respectée",
    );
  });

  it("lit l'aide, l'erreur puis les règles", () => {
    render(
      <ControlledPassword
        rules={[rules[1]]}
        hint="Choisissez un mot de passe que vous n'utilisez pas ailleurs."
        error="Le mot de passe ne respecte pas toutes les règles."
      />,
    );

    const input = screen.getByLabelText("Mot de passe");
    expect(input).toHaveAttribute("aria-invalid", "true");
    expect(input).toHaveAccessibleDescription(
      "Choisissez un mot de passe que vous n'utilisez pas ailleurs. Erreur : Le mot de passe ne respecte pas toutes les règles. Au moins un chiffre : non respectée",
    );
  });

  it("autorise le collage", () => {
    const onChange = vi.fn();
    render(<ControlledPassword onChange={onChange} />);

    const input = screen.getByLabelText("Mot de passe");
    const pasteAllowed = fireEvent.paste(input, {
      clipboardData: { getData: () => "Collé-123" },
    });
    expect(pasteAllowed).toBe(true);

    fireEvent.change(input, { target: { value: "Collé-123" } });
    expect(onChange).toHaveBeenCalledWith("Collé-123");
  });

  it("ne journalise jamais la valeur", async () => {
    const spies = (["log", "info", "warn", "error", "debug"] as const).map((method) =>
      vi.spyOn(console, method).mockImplementation(() => {}),
    );
    try {
      render(<ControlledPassword rules={rules} />);
      await userEvent.type(screen.getByLabelText("Mot de passe"), "TresSecret-42");
      for (const spy of spies) {
        for (const call of spy.mock.calls) {
          expect(JSON.stringify(call)).not.toContain("TresSecret-42");
        }
      }
    } finally {
      spies.forEach((spy) => spy.mockRestore());
    }
  });

  it("désactive le champ et le bouton œil", () => {
    render(<ControlledPassword disabled />);
    expect(screen.getByLabelText("Mot de passe")).toBeDisabled();
    expect(
      screen.getByRole("button", { name: "Afficher le mot de passe" }),
    ).toBeDisabled();
  });

  it("n'a pas d'erreur axe (règles, aide et erreur)", async () => {
    const { container } = render(
      <ControlledPassword
        rules={rules}
        hint="Choisissez un mot de passe unique."
        error="Le mot de passe ne respecte pas toutes les règles."
        required
      />,
    );
    expect(await axeViolations(container)).toEqual([]);
  });
});
