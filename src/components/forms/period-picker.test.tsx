import { useState } from "react";
import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import {
  PeriodPicker,
  type PeriodPickerProps,
} from "@/components/forms/period-picker";
import type { YearPeriodInput } from "@/lib/period";
import { mockExplorerYears } from "@/mocks";
import { axeViolations } from "@/test/axe";

function ControlledPeriod(
  props: Partial<Omit<PeriodPickerProps, "value">> & { value?: YearPeriodInput },
) {
  const [value, setValue] = useState<YearPeriodInput>(
    props.value ?? { start: undefined, end: undefined },
  );
  return (
    <PeriodPicker
      years={mockExplorerYears}
      {...props}
      value={value}
      onChange={(next, validation) => {
        setValue(next);
        props.onChange?.(next, validation);
      }}
    />
  );
}

const INVERTED = "L’année de début doit être antérieure ou égale à l’année de fin.";

describe("PeriodPicker", () => {
  it("regroupe début et fin dans un fieldset « Période »", () => {
    render(<ControlledPeriod />);

    const group = screen.getByRole("group", { name: "Période" });
    expect(group.tagName).toBe("FIELDSET");
    expect(within(group).getByRole("combobox", { name: "Année de début" })).toBeInTheDocument();
    expect(within(group).getByRole("combobox", { name: "Année de fin" })).toBeInTheDocument();
    expect(screen.queryByRole("paragraph")).not.toBeInTheDocument();
  });

  it("n'affiche aucune erreur tant que rien n'est choisi", () => {
    render(<ControlledPeriod />);
    expect(screen.queryByText(/Erreur :/)).not.toBeInTheDocument();
  });

  it("signale l'inversion sur le groupe, sans permuter les bornes", () => {
    render(<ControlledPeriod value={{ start: 2024, end: 2019 }} />);

    expect(screen.getByRole("group", { name: "Période" })).toHaveAccessibleDescription(
      `Erreur : ${INVERTED}`,
    );
    expect(screen.getByRole("combobox", { name: "Année de début" })).toHaveTextContent("2024");
    expect(screen.getByRole("combobox", { name: "Année de fin" })).toHaveTextContent("2019");
  });

  it("annonce l'erreur de groupe produite par un changement d'année (RGAA 7.5)", async () => {
    const user = userEvent.setup();
    render(<ControlledPeriod value={{ start: 2019, end: 2020 }} />);

    const live = screen.getByRole("group", { name: "Période" }).querySelector("[aria-live]");
    expect(live).toHaveAttribute("aria-live", "polite");
    expect(live).toBeEmptyDOMElement();

    const start = screen.getByRole("combobox", { name: "Année de début" });
    start.focus();
    await user.keyboard("{Enter}");
    await user.click(await screen.findByRole("option", { name: "2024" }));

    // Le message est inséré dans la région live déjà présente : il est annoncé.
    await waitFor(() => expect(live).toHaveTextContent(INVERTED));
  });

  it("affiche l'erreur du parent en plus de l'erreur d'inversion", () => {
    render(
      <ControlledPeriod value={{ start: 2024, end: 2019 }} error="Choisissez une période." />,
    );

    expect(screen.getByRole("group", { name: "Période" })).toHaveAccessibleDescription(
      `Erreur : ${INVERTED} Erreur : Choisissez une période.`,
    );
  });

  it("affiche l'erreur du parent seule quand la période est valide", () => {
    render(
      <ControlledPeriod value={{ start: 2019, end: 2024 }} error="Choisissez une période." />,
    );

    expect(screen.getByRole("group", { name: "Période" })).toHaveAccessibleDescription(
      "Erreur : Choisissez une période.",
    );
  });

  it("autorise l'année unique par défaut et la refuse si demandé", () => {
    render(
      <>
        <ControlledPeriod legend="A" value={{ start: 2022, end: 2022 }} />
        <ControlledPeriod legend="B" value={{ start: 2022, end: 2022 }} allowSingleYear={false} />
      </>,
    );
    expect(screen.getByRole("group", { name: "A" })).not.toHaveAccessibleDescription();
    expect(screen.getByRole("group", { name: "B" })).toHaveAccessibleDescription(
      "Erreur : Choisissez deux années différentes pour comparer une évolution.",
    );
  });

  it("signale la borne manquante sur son champ", () => {
    render(<ControlledPeriod value={{ start: 2020, end: undefined }} />);

    const end = screen.getByRole("combobox", { name: "Année de fin" });
    expect(end).toHaveAttribute("aria-invalid", "true");
    expect(end).toHaveAccessibleDescription("Erreur : Choisissez l’année de fin.");
  });

  it("signale l'année indisponible sur son champ", () => {
    render(<ControlledPeriod value={{ start: 2021, end: 2023 }} />);

    expect(screen.getByRole("combobox", { name: "Année de début" })).toHaveAccessibleDescription(
      "Erreur : Aucune donnée n’est disponible pour 2021. Choisissez une autre année.",
    );
  });

  it("transmet la période et sa validation au parent", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<ControlledPeriod value={{ start: 2019, end: 2020 }} onChange={onChange} />);

    const end = screen.getByRole("combobox", { name: "Année de fin" });
    end.focus();
    await user.keyboard("{Enter}");
    await user.click(await screen.findByRole("option", { name: "2024" }));

    expect(onChange).toHaveBeenLastCalledWith(
      { start: 2019, end: 2024 },
      { ok: true, period: { start: 2019, end: 2024 } },
    );
  });

  it("désactive les deux listes", () => {
    render(<ControlledPeriod disabled value={{ start: 2019, end: 2024 }} />);
    for (const combobox of screen.getAllByRole("combobox")) expect(combobox).toBeDisabled();
  });

  it("n'a pas de violation axe, valide et en erreur", async () => {
    const { container } = render(
      <>
        <ControlledPeriod legend="Valide" value={{ start: 2019, end: 2024 }} />
        <ControlledPeriod legend="Inversée" value={{ start: 2024, end: 2019 }} />
        <ControlledPeriod legend="Partielle" value={{ start: 2020, end: undefined }} />
      </>,
    );
    expect(await axeViolations(container)).toEqual([]);
  });
});
