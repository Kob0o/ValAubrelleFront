import { useState } from "react";
import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { YearPicker, type YearPickerProps } from "@/components/forms/year-picker";
import { mockExplorerYears } from "@/mocks";
import { axeViolations } from "@/test/axe";

function ControlledYear(props: Partial<YearPickerProps>) {
  const [value, setValue] = useState(props.value);
  return (
    <YearPicker
      label="Année"
      years={mockExplorerYears}
      {...props}
      value={value}
      onChange={(next) => {
        setValue(next);
        props.onChange?.(next);
      }}
    />
  );
}

async function openList(user: ReturnType<typeof userEvent.setup>) {
  const trigger = screen.getByRole("combobox", { name: "Année" });
  trigger.focus();
  await user.keyboard("{Enter}");
  return screen.findByRole("listbox");
}

describe("YearPicker", () => {
  it("trie les années de la plus récente à la plus ancienne", async () => {
    const user = userEvent.setup();
    render(<ControlledYear />);

    const list = await openList(user);
    expect(within(list).getAllByRole("option").map((option) => option.textContent)).toEqual([
      "2024",
      "2023",
      "2022",
      "2021 (sans donnée)",
      "2020",
      "2019",
      "2018 (sans donnée)",
    ]);
  });

  it("affiche l'année sans donnée, désactivée, avec son état en texte", async () => {
    const user = userEvent.setup();
    render(<ControlledYear />);

    const list = await openList(user);
    const noData = within(list).getByRole("option", { name: "2021 (sans donnée)" });
    expect(noData).toHaveAttribute("aria-disabled", "true");
    expect(noData).toHaveAttribute("data-disabled");
  });

  it("saute l'année sans donnée au clavier", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<ControlledYear value={2022} onChange={onChange} />);

    // La liste s'ouvre sur 2022 ; la flèche bas saute 2021 et arrive sur 2020.
    await openList(user);
    await user.keyboard("{ArrowDown}{Enter}");
    await waitFor(() => expect(onChange).toHaveBeenCalledWith(2020));
    expect(onChange).not.toHaveBeenCalledWith(2021);
  });

  it("ignore le clic sur une année sans donnée", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<ControlledYear value={2022} onChange={onChange} />);

    const list = await openList(user);
    const noData = within(list).getByRole("option", { name: "2021 (sans donnée)" });

    await user.click(noData);
    expect(onChange).not.toHaveBeenCalled();
    // La liste reste ouverte (rien n'a été choisi) ; Échap la ferme.
    expect(screen.getByRole("listbox")).toBeInTheDocument();
    await user.keyboard("{Escape}");
    await waitFor(() =>
      expect(screen.getByRole("combobox", { name: "Année" })).toHaveTextContent("2022"),
    );
  });

  it("renvoie un nombre", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<ControlledYear onChange={onChange} />);

    const list = await openList(user);
    await user.click(within(list).getByRole("option", { name: "2023" }));
    expect(onChange).toHaveBeenCalledWith(2023);
    expect(screen.getByRole("combobox", { name: "Année" })).toHaveTextContent("2023");
  });

  it("signale une valeur absente de la liste sous le champ", () => {
    render(<ControlledYear value={2015} />);

    const trigger = screen.getByRole("combobox", { name: "Année" });
    expect(trigger).toHaveAttribute("aria-invalid", "true");
    expect(trigger).toHaveTextContent("Choisir une année");
    expect(trigger).toHaveAccessibleDescription(
      "Erreur : L’année 2015 n’est pas disponible. Choisissez une autre année.",
    );
  });

  it("signale une valeur sans donnée reçue du parent", () => {
    render(<ControlledYear value={2021} />);
    expect(screen.getByRole("combobox", { name: "Année" })).toHaveAccessibleDescription(
      "Erreur : Aucune donnée n’est disponible pour 2021. Choisissez une autre année.",
    );
  });

  it("affiche l'erreur du parent et l'état désactivé", () => {
    render(
      <>
        <ControlledYear label="A" error="Choisissez une année." />
        <ControlledYear label="B" disabled value={2023} />
      </>,
    );
    expect(screen.getByRole("combobox", { name: "A" })).toHaveAccessibleDescription(
      "Erreur : Choisissez une année.",
    );
    expect(screen.getByRole("combobox", { name: "B" })).toBeDisabled();
  });

  it("n'a pas de violation axe, fermé, ouvert et en erreur", async () => {
    const user = userEvent.setup();
    const { container } = render(<ControlledYear value={2015} />);
    expect(await axeViolations(container)).toEqual([]);

    await openList(user);
    expect(await axeViolations(document.body)).toEqual([]);
  });
});
