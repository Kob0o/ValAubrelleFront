import {
  act,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import { useState } from "react";
import { describe, expect, it, vi } from "vitest";

import { ConfirmDialog, useConfirm } from "@/components/shared/confirm-dialog";
import { axeViolations } from "@/test/axe";

describe("ConfirmDialog (contrôlé)", () => {
  function Harness({
    onConfirm = vi.fn(),
    onCancel = vi.fn(),
    busy = false,
    error = null,
    tone,
  }: {
    onConfirm?: () => void | Promise<void>;
    onCancel?: () => void;
    busy?: boolean;
    error?: string | null;
    tone?: "default" | "danger";
  }) {
    const [open, setOpen] = useState(false);
    return (
      <>
        <button
          onClick={() => {
            setOpen(true);
          }}
        >
          Ouvrir
        </button>
        <ConfirmDialog
          open={open}
          title="Désactiver le compte"
          description="L'utilisateur ne pourra plus se connecter."
          confirmLabel="Désactiver le compte"
          tone={tone}
          busy={busy}
          error={error}
          onConfirm={onConfirm}
          onCancel={() => {
            onCancel();
            setOpen(false);
          }}
        />
      </>
    );
  }

  it("a pour nom accessible son titre et décrit les conséquences", () => {
    render(<Harness />);
    fireEvent.click(screen.getByRole("button", { name: "Ouvrir" }));

    const dialog = screen.getByRole("alertdialog", {
      name: "Désactiver le compte",
    });
    expect(dialog).toHaveAccessibleDescription(
      "L'utilisateur ne pourra plus se connecter.",
    );
  });

  it("Annuler et le bouton de confirmation ont des libellés explicites", () => {
    render(<Harness />);
    fireEvent.click(screen.getByRole("button", { name: "Ouvrir" }));

    expect(
      screen.getByRole("button", { name: "Annuler" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Désactiver le compte" }),
    ).toBeInTheDocument();
  });

  it("tone='danger' rend le bouton de confirmation en variante destructive", () => {
    render(<Harness tone="danger" />);
    fireEvent.click(screen.getByRole("button", { name: "Ouvrir" }));

    expect(
      screen.getByRole("button", { name: "Désactiver le compte" }),
    ).toHaveAttribute("data-variant", "destructive");
  });

  it("la confirmation appelle onConfirm", () => {
    const onConfirm = vi.fn();
    render(<Harness onConfirm={onConfirm} />);
    fireEvent.click(screen.getByRole("button", { name: "Ouvrir" }));

    fireEvent.click(
      screen.getByRole("button", { name: "Désactiver le compte" }),
    );
    expect(onConfirm).toHaveBeenCalledOnce();
  });

  it("Échap annule et ferme le dialogue", () => {
    const onCancel = vi.fn();
    render(<Harness onCancel={onCancel} />);
    fireEvent.click(screen.getByRole("button", { name: "Ouvrir" }));

    fireEvent.keyDown(document, { key: "Escape" });
    expect(onCancel).toHaveBeenCalledOnce();
    expect(screen.queryByRole("alertdialog")).not.toBeInTheDocument();
  });

  it("en busy, Échap et Annuler sont bloqués et le bouton signale l'état", () => {
    const onCancel = vi.fn();
    render(<Harness busy onCancel={onCancel} />);
    fireEvent.click(screen.getByRole("button", { name: "Ouvrir" }));

    const confirmButton = screen.getByRole("button", {
      name: "Confirmation en cours…",
    });
    expect(confirmButton).toBeDisabled();
    expect(confirmButton).toHaveAttribute("aria-busy", "true");
    expect(screen.getByRole("button", { name: "Annuler" })).toBeDisabled();

    fireEvent.keyDown(document, { key: "Escape" });
    expect(onCancel).not.toHaveBeenCalled();
    expect(screen.getByRole("alertdialog")).toBeInTheDocument();
  });

  it("une erreur s'affiche dans le dialogue (role='alert') sans le fermer", () => {
    render(<Harness error="L'action n'a pas abouti. Réessayez." />);
    fireEvent.click(screen.getByRole("button", { name: "Ouvrir" }));

    expect(screen.getByRole("alert")).toHaveTextContent(
      "L'action n'a pas abouti. Réessayez.",
    );
    expect(screen.getByRole("alertdialog")).toBeInTheDocument();
  });

  it("aucune violation axe", async () => {
    render(<Harness tone="danger" />);
    fireEvent.click(screen.getByRole("button", { name: "Ouvrir" }));
    expect(await axeViolations()).toEqual([]);
  });
});

describe("useConfirm", () => {
  function HookHarness({
    onConfirm,
    onResult,
  }: {
    onConfirm: () => void | Promise<void>;
    onResult: (confirmed: boolean) => void;
  }) {
    const { confirm, confirmDialog } = useConfirm();
    return (
      <>
        <button
          onClick={() => {
            void confirm({
              title: "Supprimer le brouillon",
              description: "Cette action est définitive.",
              confirmLabel: "Supprimer le brouillon",
              tone: "danger",
              onConfirm,
            }).then(onResult);
          }}
        >
          Demander confirmation
        </button>
        {confirmDialog}
      </>
    );
  }

  it("la confirmation renvoie true après onConfirm", async () => {
    const onConfirm = vi.fn().mockResolvedValue(undefined);
    const onResult = vi.fn();
    render(<HookHarness onConfirm={onConfirm} onResult={onResult} />);

    fireEvent.click(
      screen.getByRole("button", { name: "Demander confirmation" }),
    );
    fireEvent.click(
      await screen.findByRole("button", { name: "Supprimer le brouillon" }),
    );

    await waitFor(() => expect(onResult).toHaveBeenCalledWith(true));
    expect(screen.queryByRole("alertdialog")).not.toBeInTheDocument();
  });

  it("l'annulation renvoie false", async () => {
    const onConfirm = vi.fn();
    const onResult = vi.fn();
    render(<HookHarness onConfirm={onConfirm} onResult={onResult} />);

    fireEvent.click(
      screen.getByRole("button", { name: "Demander confirmation" }),
    );
    fireEvent.click(await screen.findByRole("button", { name: "Annuler" }));

    await waitFor(() => expect(onResult).toHaveBeenCalledWith(false));
    expect(onConfirm).not.toHaveBeenCalled();
  });

  it("un échec de onConfirm affiche l'erreur et garde le dialogue ouvert", async () => {
    const onConfirm = vi.fn().mockRejectedValue(new Error("réseau"));
    const onResult = vi.fn();
    render(<HookHarness onConfirm={onConfirm} onResult={onResult} />);

    fireEvent.click(
      screen.getByRole("button", { name: "Demander confirmation" }),
    );
    fireEvent.click(
      await screen.findByRole("button", { name: "Supprimer le brouillon" }),
    );

    expect(await screen.findByRole("alert")).toHaveTextContent(
      "L'action n'a pas abouti. Vérifiez votre connexion puis réessayez.",
    );
    expect(screen.getByRole("alertdialog")).toBeInTheDocument();
    expect(onResult).not.toHaveBeenCalled();

    // On peut encore annuler après l'erreur.
    await act(async () => {
      fireEvent.click(screen.getByRole("button", { name: "Annuler" }));
    });
    await waitFor(() => expect(onResult).toHaveBeenCalledWith(false));
  });
});
