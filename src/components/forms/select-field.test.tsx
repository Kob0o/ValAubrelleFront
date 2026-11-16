import { useState } from "react";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import {
  SelectField,
  type SelectFieldProps,
  type SelectOption,
} from "@/components/forms/select-field";
import { axeViolations } from "@/test/axe";

const options: SelectOption[] = [
  { value: "mayor", label: "Maire" },
  { value: "housing_officer", label: "Agent Habitat" },
  { value: "admin", label: "Administrateur", disabled: true },
];

function ControlledSelect(props: Partial<SelectFieldProps>) {
  const [value, setValue] = useState(props.value);
  return (
    <SelectField
      label="Rôle"
      options={options}
      {...props}
      value={value}
      onChange={(next) => {
        setValue(next);
        props.onChange?.(next);
      }}
    />
  );
}

describe.each([
  ["Select", false],
  ["Select searchable", true],
] as const)("%s", (_name, searchable) => {
  it("affiche le libellé et le placeholder quand rien n'est choisi", () => {
    render(<ControlledSelect searchable={searchable} placeholder="Choisir un rôle" />);

    const trigger = screen.getByRole("combobox", { name: "Rôle" });
    expect(trigger).toHaveTextContent("Choisir un rôle");
    expect(trigger).toHaveAttribute("aria-expanded", "false");
  });

  it.each(["{Enter}", " ", "{ArrowDown}"])(
    "s'ouvre au clavier avec %s et se ferme avec Échap en rendant le focus",
    async (key) => {
      const user = userEvent.setup();
      render(<ControlledSelect searchable={searchable} />);

      const trigger = screen.getByRole("combobox", { name: "Rôle" });
      trigger.focus();
      await user.keyboard(key);

      expect(await screen.findByRole("option", { name: "Maire" })).toBeVisible();
      expect(trigger).toHaveAttribute("aria-expanded", "true");

      await user.keyboard("{Escape}");

      await waitFor(() =>
        expect(screen.queryByRole("option", { name: "Maire" })).not.toBeInTheDocument(),
      );
      expect(trigger).toHaveFocus();
    },
  );

  it("sélectionne une option au clavier", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<ControlledSelect searchable={searchable} onChange={onChange} />);

    const trigger = screen.getByRole("combobox", { name: "Rôle" });
    trigger.focus();
    await user.keyboard("{Enter}");
    await screen.findByRole("option", { name: "Maire" });
    await user.keyboard("{ArrowDown}{Enter}");

    await waitFor(() => expect(onChange).toHaveBeenCalledWith("housing_officer"));
    expect(trigger).toHaveTextContent("Agent Habitat");
  });

  it("relie l'erreur et l'aide au déclencheur", () => {
    render(
      <ControlledSelect
        searchable={searchable}
        required
        hint="Rôle du compte."
        error="Choisissez un rôle."
      />,
    );

    const trigger = screen.getByRole("combobox", { name: /Rôle.*obligatoire/ });
    expect(trigger).toHaveAttribute("aria-invalid", "true");
    expect(trigger).toHaveAccessibleDescription(
      "Rôle du compte. Erreur : Choisissez un rôle.",
    );
  });

  it("ne s'ouvre pas quand il est désactivé", async () => {
    const user = userEvent.setup();
    render(<ControlledSelect searchable={searchable} disabled value="mayor" />);

    const trigger = screen.getByRole("combobox", { name: "Rôle" });
    expect(trigger).toBeDisabled();
    expect(trigger).toHaveTextContent("Maire");

    await user.click(trigger);
    expect(screen.queryByRole("option")).not.toBeInTheDocument();
  });

  it("explique une liste vide", async () => {
    const user = userEvent.setup();
    render(<ControlledSelect searchable={searchable} options={[]} />);

    await user.click(screen.getByRole("combobox", { name: "Rôle" }));
    expect(await screen.findByText("Aucune option disponible")).toBeVisible();
  });

  it("transmet sa valeur à un formulaire HTML et applique required", async () => {
    const user = userEvent.setup();
    render(
      <form data-testid="form">
        <ControlledSelect searchable={searchable} name="role" required />
      </form>,
    );
    const form = screen.getByTestId("form") as HTMLFormElement;

    expect(form.checkValidity()).toBe(false);

    const trigger = screen.getByRole("combobox", { name: /Rôle/ });
    trigger.focus();
    await user.keyboard("{Enter}");
    await screen.findByRole("option", { name: "Maire" });
    await user.keyboard("{Enter}");

    await waitFor(() =>
      expect(new FormData(form).get("role")).toBe("mayor"),
    );
    expect(form.checkValidity()).toBe(true);
  });

  it("n'a pas de violation axe", async () => {
    const { container } = render(
      <ControlledSelect searchable={searchable} required hint="Aide" error="Erreur" />,
    );
    expect(await axeViolations(container)).toEqual([]);
  });
});

describe("Select searchable", () => {
  it("filtre les options par libellé", async () => {
    const user = userEvent.setup();
    render(<ControlledSelect searchable />);

    await user.click(screen.getByRole("combobox", { name: "Rôle" }));
    const search = await screen.findByRole("combobox", { name: "Rechercher dans Rôle" });
    await waitFor(() => expect(search).toHaveFocus());

    await user.keyboard("habitat");
    expect(screen.getByRole("option", { name: "Agent Habitat" })).toBeVisible();
    expect(screen.queryByRole("option", { name: "Maire" })).not.toBeInTheDocument();

    await user.keyboard("zzz");
    expect(screen.getByText("Aucun résultat")).toBeVisible();
  });
});
