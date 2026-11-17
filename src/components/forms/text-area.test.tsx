import { useState } from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import {
  TextArea,
  counterAnnouncement,
  type TextAreaProps,
} from "@/components/forms/text-area";
import { axeViolations } from "@/test/axe";

/** Espace fine insécable utilisée par `Intl.NumberFormat("fr-FR")`. */
const NNBSP = " ";

function ControlledTextArea(props: Partial<TextAreaProps>) {
  const [value, setValue] = useState(props.value ?? "");
  return (
    <TextArea
      label="Précisions"
      name="text"
      {...props}
      value={value}
      onChange={(next) => {
        setValue(next);
        props.onChange?.(next);
      }}
    />
  );
}

describe("TextArea", () => {
  it("relie le libellé, l'aide et l'erreur comme TextField", () => {
    render(
      <ControlledTextArea
        hint="Décrivez la situation du logement."
        error="Les précisions sont obligatoires."
        required
      />,
    );

    const textarea = screen.getByRole("textbox", { name: "Précisions" });
    expect(textarea).toBeRequired();
    expect(textarea).toHaveAttribute("aria-invalid", "true");
    expect(textarea).toHaveAccessibleDescription(
      "Décrivez la situation du logement. Erreur : Les précisions sont obligatoires.",
    );
    expect(textarea).toHaveAttribute("rows", "10");
  });

  it("affiche le compteur au format français", () => {
    render(
      <ControlledTextArea value={"a".repeat(120)} maxLength={4000} showCounter />,
    );
    expect(
      // La normalisation de Testing Library remplace l'espace fine par une espace.
      screen.getByText(/^120 \/ 4\s000 caractères$/),
    ).toBeVisible();
  });

  it("bloque la saisie au-delà de maxLength", async () => {
    const onChange = vi.fn();
    render(<ControlledTextArea maxLength={5} showCounter onChange={onChange} />);

    const textarea = screen.getByRole("textbox", { name: "Précisions" });
    await userEvent.type(textarea, "abcdefgh");

    expect(textarea).toHaveValue("abcde");
    expect(textarea).toHaveAttribute("maxlength", "5");
    expect(onChange).toHaveBeenLastCalledWith("abcde");
    expect(screen.getByText("5 / 5 caractères — limite atteinte")).toBeVisible();
  });

  it("tronque une valeur trop longue reçue autrement que par la frappe", () => {
    const onChange = vi.fn();
    render(<ControlledTextArea maxLength={5} onChange={onChange} />);

    fireEvent.change(screen.getByRole("textbox"), {
      target: { value: "abcdefgh" },
    });
    expect(onChange).toHaveBeenLastCalledWith("abcde");
  });

  it("n'annonce le reste qu'à l'approche de la limite", async () => {
    render(<ControlledTextArea maxLength={100} showCounter />);

    const live = document.querySelector('[aria-live="polite"]');
    expect(live).toHaveTextContent("");

    const textarea = screen.getByRole("textbox", { name: "Précisions" });
    fireEvent.change(textarea, { target: { value: "a".repeat(50) } });
    expect(live).toHaveTextContent("");

    fireEvent.change(textarea, { target: { value: "a".repeat(85) } });
    expect(live).toHaveTextContent("Au plus 20 caractères restants.");

    fireEvent.change(textarea, { target: { value: "a".repeat(100) } });
    expect(live).toHaveTextContent("Limite de 100 caractères atteinte.");
  });

  it("change l'annonce par paliers de 10 caractères seulement", () => {
    expect(counterAnnouncement(3985, 4000)).toBe("Au plus 20 caractères restants.");
    expect(counterAnnouncement(3989, 4000)).toBe("Au plus 20 caractères restants.");
    // Il reste exactement 10 caractères : « au plus 10 », pas « moins de 10 ».
    expect(counterAnnouncement(3990, 4000)).toBe("Au plus 10 caractères restants.");
    expect(counterAnnouncement(3991, 4000)).toBe("Au plus 10 caractères restants.");
    expect(counterAnnouncement(3000, 4000)).toBe("");
    expect(counterAnnouncement(3600, 4000)).toBe(
      `Au plus 400 caractères restants.`,
    );
    expect(counterAnnouncement(4000, 4000)).toBe(
      `Limite de 4${NNBSP}000 caractères atteinte.`,
    );
  });

  it("distingue désactivé et lecture seule", () => {
    render(
      <>
        <ControlledTextArea label="Désactivé" value="x" disabled />
        <ControlledTextArea label="Lecture seule" value="y" readOnly />
      </>,
    );
    expect(screen.getByRole("textbox", { name: "Désactivé" })).toBeDisabled();
    const readOnly = screen.getByRole("textbox", { name: "Lecture seule" });
    expect(readOnly).toHaveAttribute("readonly");
    expect(readOnly).not.toBeDisabled();
  });

  it("n'a pas d'erreur axe", async () => {
    const { container } = render(
      <ControlledTextArea
        maxLength={4000}
        showCounter
        hint="Décrivez la situation."
        error="Les précisions sont obligatoires."
      />,
    );
    expect(await axeViolations(container)).toEqual([]);
  });
});
