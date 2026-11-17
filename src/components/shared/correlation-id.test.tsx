import { act, cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { CorrelationId } from "@/components/shared/correlation-id";
import { axeViolations } from "@/test/axe";

const ID = "3f2b8c1e-9a4d-4e7b-8c21-5d6f0a1b2c3d";

function mockClipboard(writeText: unknown) {
  Object.defineProperty(navigator, "clipboard", {
    configurable: true,
    value: writeText === undefined ? undefined : { writeText },
  });
}

afterEach(() => {
  cleanup();
  mockClipboard(undefined);
});

async function clickCopy() {
  await act(async () => {
    screen.getByRole("button", { name: "Copier la référence" }).click();
  });
}

describe("CorrelationId", () => {
  it("affiche l'identifiant entier avec le libellé par défaut", () => {
    render(<CorrelationId id={ID} />);

    expect(screen.getByText(/Référence de l'erreur/)).toBeInTheDocument();
    const code = screen.getByText(ID);
    expect(code.tagName).toBe("CODE");
    expect(code).toHaveClass("font-mono", "select-all", "break-all");
  });

  it("ne présente aucune violation axe", async () => {
    const { container } = render(<CorrelationId id={ID} />);
    expect(await axeViolations(container)).toEqual([]);
  });

  it("accepte un libellé personnalisé", () => {
    render(<CorrelationId id={ID} label="Référence support" />);
    expect(screen.getByText(/Référence support/)).toBeInTheDocument();
  });

  it("copie dans le presse-papiers et l'annonce poliment", async () => {
    const writeText = vi.fn().mockResolvedValue(undefined);
    mockClipboard(writeText);
    render(<CorrelationId id={ID} />);

    const status = screen.getByText("", { selector: "[aria-live]" });
    expect(status).toHaveAttribute("aria-live", "polite");

    await clickCopy();

    expect(writeText).toHaveBeenCalledWith(ID);
    expect(status).toHaveTextContent("Référence copiée");
  });

  it("vide puis réécrit le message à chaque copie pour qu'il soit réannoncé", async () => {
    let resolveCopy: () => void = () => {};
    const writeText = vi
      .fn()
      .mockResolvedValueOnce(undefined)
      .mockImplementationOnce(
        () => new Promise<void>((resolve) => { resolveCopy = resolve; }),
      );
    mockClipboard(writeText);
    render(<CorrelationId id={ID} />);
    const status = screen.getByText("", { selector: "[aria-live]" });

    await clickCopy();
    expect(status).toHaveTextContent("Référence copiée");

    await clickCopy();
    expect(status).toHaveTextContent(/^$/);

    await act(async () => resolveCopy());
    expect(status).toHaveTextContent("Référence copiée");
  });

  it("affiche un message d'échec si la copie est refusée", async () => {
    mockClipboard(vi.fn().mockRejectedValue(new Error("refus")));
    render(<CorrelationId id={ID} />);

    await clickCopy();

    expect(
      screen.getByText("Copie impossible : sélectionnez le texte"),
    ).toBeInTheDocument();
  });

  it("affiche un message d'échec sans presse-papiers", async () => {
    mockClipboard(undefined);
    render(<CorrelationId id={ID} />);

    await clickCopy();

    expect(
      screen.getByText("Copie impossible : sélectionnez le texte"),
    ).toBeInTheDocument();
  });
});
