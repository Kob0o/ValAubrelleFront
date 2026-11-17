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

  it("signale un champ obligatoire par un badge visuel et l'attribut required", () => {
    render(<ControlledField required />);

    const input = screen.getByRole("textbox", { name: "Nom" });
    expect(input).toBeRequired();
    expect(input).toHaveAttribute("aria-required", "true");
    expect(screen.getByText("Obligatoire")).toHaveAttribute("aria-hidden", "true");
    expect(screen.queryByText("*")).not.toBeInTheDocument();
  });

  it("affiche l'aide dans une infobulle au survol, au clavier et au clic", async () => {
    const user = userEvent.setup();
    render(<ControlledField hint="Tel qu'il figure sur le mandat." />);

    const help = screen.getByRole("button", { name: "Aide : Nom" });
    expect(screen.queryByRole("tooltip")).not.toBeInTheDocument();

    await user.hover(help);
    expect(await screen.findByRole("tooltip")).toHaveTextContent(
      "Tel qu'il figure sur le mandat.",
    );
    await user.unhover(help);

    // L'icône est à côté du libellé : elle précède le champ au clavier.
    await user.tab();
    expect(help).toHaveFocus();
    expect(await screen.findByRole("tooltip")).toBeInTheDocument();
    await user.keyboard("{Escape}");
    expect(screen.queryByRole("tooltip")).not.toBeInTheDocument();

    await user.click(help);
    expect(await screen.findByRole("tooltip")).toBeInTheDocument();
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

  it("affiche et masque le mot de passe avec le bouton œil", async () => {
    const user = userEvent.setup();
    render(<ControlledField label="Mot de passe" type="password" value="secret" />);

    const input = screen.getByLabelText("Mot de passe");
    const toggle = screen.getByRole("button", { name: "Afficher le mot de passe" });
    expect(input).toHaveAttribute("type", "password");
    expect(toggle).toHaveAttribute("aria-pressed", "false");

    await user.click(toggle);
    expect(input).toHaveAttribute("type", "text");
    expect(toggle).toHaveAttribute("aria-pressed", "true");

    await user.click(toggle);
    expect(input).toHaveAttribute("type", "password");
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
