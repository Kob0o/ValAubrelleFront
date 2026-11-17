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

function formatCommunesCount(count: number): string {
  if (count === 0) return "Aucune commune sélectionnée";
  if (count === 1) return "1 commune sélectionnée";
  return `${count} communes sélectionnées`;
}

function ControlledMultiSelect(props: Partial<MultiSelectProps>) {
  const [value, setValue] = useState(props.value ?? []);
  return (
    <MultiSelect
      label="Communes"
      options={options}
      formatSelectionCount={formatCommunesCount}
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
    expect(bellemont).toHaveAttribute("aria-disabled", "true");

    await user.click(screen.getByRole("button", { name: "Tout sélectionner" }));
    expect(onChange).toHaveBeenLastCalledWith(["aubrecourt", "ecully"]);
    expect(screen.getByText(/Limite atteinte \(2\)/)).toBeVisible();
  });

  it("trouve une option accentuée avec une recherche sans accent", async () => {
    const user = userEvent.setup();
    render(<ControlledMultiSelect />);

    await user.click(screen.getByRole("combobox", { name: "Communes" }));
    const search = await screen.findByRole("searchbox", {
      name: "Rechercher dans Communes",
    });
    await user.clear(search);
    await user.type(search, "ecully");

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
    const search = await screen.findByRole("searchbox", {
      name: "Rechercher dans Communes",
    });
    search.focus();
    await user.keyboard("{Backspace}");

    expect(onChange).toHaveBeenCalledWith(["aubrecourt"]);
  });

  it("coche l'option active avec Espace quand la recherche est vide", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<ControlledMultiSelect onChange={onChange} />);

    await user.click(screen.getByRole("combobox", { name: "Communes" }));
    const search = await screen.findByRole("searchbox", {
      name: "Rechercher dans Communes",
    });
    search.focus();
    await user.keyboard(" ");

    expect(onChange).toHaveBeenCalledWith(["aubrecourt"]);
  });

  it("affiche + 1 autre au-delà de 3 pastilles", () => {
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
    expect(within(chips).getByText("+ 1 autre")).toBeVisible();
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

  it("annonce correctement le nombre de communes sélectionnées", () => {
    const { rerender } = render(
      <MultiSelect
        label="Communes"
        options={options}
        value={["ecully"]}
        onChange={() => {}}
        formatSelectionCount={formatCommunesCount}
      />,
    );

    expect(screen.getByRole("status")).toHaveTextContent(
      "1 commune sélectionnée",
    );

    rerender(
      <MultiSelect
        label="Communes"
        options={options}
        value={["ecully", "aubrecourt", "bellemont"]}
        onChange={() => {}}
        formatSelectionCount={formatCommunesCount}
      />,
    );

    expect(screen.getByRole("status")).toHaveTextContent(
      "3 communes sélectionnées",
    );
  });

  it("garde aria-selected sur la sélection réelle, pas sur l'option active", async () => {
    const user = userEvent.setup();
    render(<ControlledMultiSelect value={["ecully"]} />);

    await user.click(screen.getByRole("combobox", { name: "Communes" }));
    const selected = await screen.findByRole("option", { name: "Écully" });
    const activeUnselected = screen.getByRole("option", { name: "Aubrecourt" });

    expect(selected).toHaveAttribute("aria-selected", "true");
    expect(activeUnselected).toHaveAttribute("aria-selected", "false");
    expect(activeUnselected).toHaveAttribute("data-active", "true");
  });

  it("relie aria-controls au panneau et nomme la listbox Communes", async () => {
    const user = userEvent.setup();
    render(<ControlledMultiSelect value={["ecully"]} />);

    const trigger = screen.getByRole("combobox", { name: "Communes" });
    await user.click(trigger);

    const panelId = trigger.getAttribute("aria-controls");
    expect(panelId).toBeTruthy();
    expect(document.getElementById(panelId!)).not.toBeNull();

    const listbox = await screen.findByRole("listbox", { name: "Communes" });
    expect(listbox).toHaveAttribute("aria-multiselectable", "true");
    expect(screen.getAllByRole("listbox")).toHaveLength(1);
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
    render(<ControlledMultiSelect value={["ecully"]} />);

    await user.click(screen.getByRole("combobox", { name: "Communes" }));
    await screen.findByRole("option", { name: "Écully" });

    expect(await axeViolations(document.body)).toEqual([]);
  });
});
