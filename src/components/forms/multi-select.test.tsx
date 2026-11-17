import { useState } from "react";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import {
  MultiSelect,
  type MultiSelectOption,
  type MultiSelectProps,
} from "@/components/forms/multi-select";
import { normalizeSearch } from "@/lib/normalize-search";
import { axeViolations } from "@/test/axe";

const options: MultiSelectOption[] = [
  { value: "aubrecourt", label: "Aubrecourt" },
  { value: "ecully", label: "Écully" },
  { value: "bellemont", label: "Bellemont" },
  { value: "beaurain", label: "Beaurain" },
];

function ControlledMultiSelect(props: Partial<MultiSelectProps>) {
  const [value, setValue] = useState(props.value ?? []);
  return (
    <MultiSelect
      label="Communes"
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

describe("normalizeSearch", () => {
  it("ignore accents et casse", () => {
    expect(normalizeSearch("Écully")).toBe("ecully");
    expect(normalizeSearch("ÉCULLy")).toBe("ecully");
  });
});

describe("MultiSelect", () => {
  it("respecte max à la sélection et via Tout sélectionner", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<ControlledMultiSelect max={2} onChange={onChange} />);

    await user.click(screen.getByRole("combobox", { name: "Communes" }));
    await user.click(await screen.findByRole("option", { name: "Aubrecourt" }));
    await user.click(screen.getByRole("option", { name: "Écully" }));

    expect(onChange).toHaveBeenLastCalledWith(["aubrecourt", "ecully"]);

    const bellemont = screen.getByRole("option", { name: "Bellemont" });
    expect(bellemont).toHaveAttribute("data-disabled", "true");

    await user.click(screen.getByRole("button", { name: "Tout sélectionner" }));
    expect(onChange).toHaveBeenLastCalledWith(["aubrecourt", "ecully"]);
    expect(screen.getByText(/Limite atteinte \(2\)/)).toBeVisible();
  });

  it("trouve une option accentuée avec une recherche sans accent", async () => {
    const user = userEvent.setup();
    render(<ControlledMultiSelect />);

    await user.click(screen.getByRole("combobox", { name: "Communes" }));
    const search = await screen.findByRole("combobox", {
      name: "Rechercher dans Communes",
    });
    await user.click(search);
    await user.keyboard("ecully");

    expect(screen.getByRole("option", { name: "Écully" })).toBeVisible();
    expect(
      screen.queryByRole("option", { name: "Aubrecourt" }),
    ).not.toBeInTheDocument();
  });

  it("retire une pastille via le bouton Retirer", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(
      <ControlledMultiSelect
        value={["aubrecourt", "ecully"]}
        onChange={onChange}
      />,
    );

    await user.click(screen.getByRole("button", { name: "Retirer Aubrecourt" }));
    expect(onChange).toHaveBeenCalledWith(["ecully"]);
  });

  it("retire la dernière pastille avec Backspace quand la recherche est vide", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(
      <ControlledMultiSelect
        value={["aubrecourt", "ecully"]}
        onChange={onChange}
      />,
    );

    await user.click(screen.getByRole("combobox", { name: "Communes" }));
    const search = await screen.findByRole("combobox", {
      name: "Rechercher dans Communes",
    });
    await user.click(search);
    await user.keyboard("{Backspace}");

    expect(onChange).toHaveBeenCalledWith(["aubrecourt"]);
  });

  it("affiche + N autres au-delà de 3 pastilles", () => {
    render(
      <ControlledMultiSelect
        value={["aubrecourt", "ecully", "bellemont", "beaurain"]}
      />,
    );

    const chips = screen.getByRole("list", { name: "Sélection actuelle" });
    expect(within(chips).getByText("Aubrecourt")).toBeVisible();
    expect(within(chips).getByText("Écully")).toBeVisible();
    expect(within(chips).getByText("Bellemont")).toBeVisible();
    expect(within(chips).queryByText("Beaurain")).not.toBeInTheDocument();
    expect(within(chips).getByText("+ 1 autres")).toBeVisible();
  });

  it("groupe les options", async () => {
    const user = userEvent.setup();
    render(
      <ControlledMultiSelect
        options={[
          { value: "a", label: "Nord A", group: "Nord" },
          { value: "b", label: "Sud B", group: "Sud" },
        ]}
      />,
    );

    await user.click(screen.getByRole("combobox", { name: "Communes" }));
    expect(await screen.findByText("Nord")).toBeVisible();
    expect(screen.getByText("Sud")).toBeVisible();
  });

  it("n'a pas de violation axe fermé", async () => {
    const { container } = render(
      <ControlledMultiSelect
        required
        hint="Aide"
        error="Erreur"
        value={["ecully"]}
      />,
    );
    expect(await axeViolations(container)).toEqual([]);
  });

  it("n'a pas de violation axe ouvert", async () => {
    const user = userEvent.setup();
    const { container } = render(
      <ControlledMultiSelect value={["ecully"]} />,
    );

    await user.click(screen.getByRole("combobox", { name: "Communes" }));
    await screen.findByRole("option", { name: "Écully" });

    expect(await axeViolations(container)).toEqual([]);
  });
});
