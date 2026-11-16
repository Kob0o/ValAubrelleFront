import { useState } from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { TextField, type TextFieldProps } from "@/components/forms/text-field";
import { axeViolations } from "@/test/axe";

function ControlledField(props: Partial<TextFieldProps>) {
  const [value, setValue] = useState(props.value ?? "");
  return (
    <TextField
      label="Nom"
      name="name"
      {...props}
      value={value}
      onChange={(next) => {
        setValue(next);
        props.onChange?.(next);
      }}
    />
  );
}

describe("TextField", () => {
  it("relie un libellé toujours visible au champ", () => {
    render(<ControlledField placeholder="Exemple" />);

    const input = screen.getByRole("textbox", { name: "Nom" });
    expect(input).toHaveAttribute("name", "name");
    expect(input).not.toHaveAttribute("aria-invalid");
    expect(screen.getByText("Nom")).toBeVisible();
  });

  it("annonce « obligatoire » en texte, pas seulement par l'astérisque", () => {
    render(<ControlledField required />);

    const input = screen.getByRole("textbox", { name: /Nom.*obligatoire/ });
    expect(input).toBeRequired();
    expect(input).toHaveAttribute("aria-required", "true");
    expect(screen.getByText("*")).toHaveAttribute("aria-hidden", "true");
  });

  it("relie l'aide et l'erreur par aria-describedby et marque le champ invalide", () => {
    render(
      <ControlledField
        hint="Tel qu'il figure sur le mandat."
        error="Le nom est obligatoire."
      />,
    );

    const input = screen.getByRole("textbox", { name: "Nom" });
    expect(input).toHaveAttribute("aria-invalid", "true");
    expect(input).toHaveAccessibleDescription(
      "Tel qu'il figure sur le mandat. Erreur : Le nom est obligatoire.",
    );
    expect(screen.getByText("Le nom est obligatoire.")).toBeVisible();
  });

  it("transmet la valeur saisie et met à jour le compteur", async () => {
    const onChange = vi.fn();
    render(<ControlledField maxLength={10} showCounter onChange={onChange} />);

    const input = screen.getByRole("textbox", { name: "Nom" });
    expect(input).toHaveAccessibleDescription("0 / 10 caractères");

    await userEvent.type(input, "Lou");

    expect(onChange).toHaveBeenLastCalledWith("Lou");
    expect(input).toHaveValue("Lou");
    expect(screen.getByText("3 / 10 caractères")).toBeVisible();
    expect(input).toHaveAttribute("maxlength", "10");
  });

  it("n'affiche pas de compteur sans maxLength", () => {
    render(<ControlledField showCounter />);
    expect(screen.queryByText(/caractères/)).not.toBeInTheDocument();
  });

  it("gère les états désactivé et lecture seule", async () => {
    const onChange = vi.fn();
    render(
      <>
        <TextField label="A" name="a" value="x" onChange={onChange} disabled />
        <TextField label="B" name="b" value="y" onChange={onChange} readOnly />
      </>,
    );

    expect(screen.getByRole("textbox", { name: "A" })).toBeDisabled();
    const readOnly = screen.getByRole("textbox", { name: "B" });
    expect(readOnly).toHaveAttribute("readonly");

    await userEvent.type(readOnly, "z");
    expect(onChange).not.toHaveBeenCalled();
  });

  it("accepte les types email et password", () => {
    render(
      <>
        <TextField label="E-mail" name="email" type="email" value="" onChange={() => {}} />
        <TextField label="Mot de passe" name="password" type="password" value="" onChange={() => {}} />
      </>,
    );

    expect(screen.getByRole("textbox", { name: "E-mail" })).toHaveAttribute("type", "email");
    expect(screen.getByLabelText("Mot de passe")).toHaveAttribute("type", "password");
  });

  it("n'a pas de violation axe, y compris en erreur", async () => {
    const { container } = render(
      <ControlledField required hint="Aide" error="Erreur" maxLength={5} showCounter />,
    );
    expect(await axeViolations(container)).toEqual([]);
  });
});
