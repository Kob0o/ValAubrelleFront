import { useState } from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import {
  Radio,
  RadioGroup,
  type RadioGroupProps,
} from "@/components/forms/radio-group";
import { axeViolations } from "@/test/axe";

function Visibility(
  props: Partial<Omit<RadioGroupProps, "children">> & { thirdDisabled?: boolean },
) {
  const { thirdDisabled, ...groupProps } = props;
  const [value, setValue] = useState(props.value);
  return (
    <>
      <RadioGroup
        legend="Visibilité du rapport"
        name="visibility"
        {...groupProps}
        value={value}
        onChange={(next) => {
          setValue(next);
          props.onChange?.(next);
        }}
      >
        <Radio value="internal" label="Interne" />
        <Radio
          value="elected"
          label="Élus de la commune"
          description="Visible par le maire et les élus."
        />
        <Radio value="public" label="Public" disabled={thirdDisabled} />
      </RadioGroup>
      <button type="button">Après</button>
    </>
  );
}

describe("RadioGroup", () => {
  it("regroupe les options dans un fieldset avec une légende visible", () => {
    render(<Visibility />);

    const fieldset = screen.getByRole("group", { name: "Visibilité du rapport" });
    expect(fieldset.tagName).toBe("FIELDSET");
    expect(screen.getByText("Visibilité du rapport").tagName).toBe("LEGEND");
    expect(
      screen.getByRole("radiogroup", { name: "Visibilité du rapport" }),
    ).toBeInTheDocument();
    expect(screen.getAllByRole("radio")).toHaveLength(3);
  });

  it("aucun choix au départ, puis choix au clic sur le libellé", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<Visibility onChange={onChange} />);

    for (const radio of screen.getAllByRole("radio")) {
      expect(radio).not.toBeChecked();
    }
    await user.click(screen.getByText("Élus de la commune"));
    expect(screen.getByRole("radio", { name: "Élus de la commune" })).toBeChecked();
    expect(onChange).toHaveBeenCalledWith("elected");
  });

  it("flèches pour changer d'option, Tab pour sortir du groupe", async () => {
    const user = userEvent.setup();
    render(<Visibility value="internal" />);

    await user.tab();
    expect(screen.getByRole("radio", { name: "Interne" })).toHaveFocus();

    // Touche maintenue : Radix déplace le focus de façon asynchrone et ne
    // coche que si la flèche est encore enfoncée (comportement du navigateur).
    await user.keyboard("{ArrowDown>}");
    const elected = screen.getByRole("radio", { name: "Élus de la commune" });
    expect(elected).toHaveFocus();
    expect(elected).toBeChecked();
    await user.keyboard("{/ArrowDown}");

    await user.tab();
    expect(screen.getByRole("button", { name: "Après" })).toHaveFocus();
  });

  it("saute une option désactivée au clavier", async () => {
    const user = userEvent.setup();
    render(<Visibility value="elected" thirdDisabled />);

    await user.tab();
    await user.keyboard("{ArrowDown}");
    expect(screen.getByRole("radio", { name: "Interne" })).toHaveFocus();
    expect(screen.getByRole("radio", { name: "Public" })).toBeDisabled();
  });

  it("porte l'erreur sur le groupe", () => {
    render(<Visibility error="Choisissez la visibilité du rapport." required />);

    const group = screen.getByRole("radiogroup");
    expect(group).toHaveAttribute("aria-invalid", "true");
    expect(group).toHaveAttribute("aria-required", "true");
    expect(group).toHaveAccessibleDescription(
      "Erreur : Choisissez la visibilité du rapport.",
    );
    expect(screen.getByText("Obligatoire")).toHaveAttribute("aria-hidden", "true");
  });

  it("lit la description d'une option avec elle", () => {
    render(<Visibility />);
    expect(
      screen.getByRole("radio", { name: "Élus de la commune" }),
    ).toHaveAccessibleDescription("Visible par le maire et les élus.");
  });

  it("désactive tout le groupe", () => {
    render(<Visibility disabled />);
    for (const radio of screen.getAllByRole("radio")) {
      expect(radio).toBeDisabled();
    }
  });

  it("n'a pas d'erreur axe", async () => {
    const { container } = render(
      <Visibility hint="Qui pourra lire ce rapport." error="Choisissez." required />,
    );
    expect(await axeViolations(container)).toEqual([]);
  });
});
