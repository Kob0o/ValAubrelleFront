import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { useState } from "react";
import { describe, expect, it, vi } from "vitest";

import { Modal } from "@/components/shared/modal";
import { axeViolations } from "@/test/axe";

function ModalHarness({
  onClose = vi.fn(),
  size,
}: {
  onClose?: () => void;
  size?: "sm" | "md" | "lg";
}) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button
        onClick={() => {
          setOpen(true);
        }}
      >
        Ouvrir la fenêtre
      </button>
      <Modal
        open={open}
        onClose={() => {
          onClose();
          setOpen(false);
        }}
        title="Modifier la commune"
        description="Les changements sont enregistrés à la validation."
        size={size}
        footer={<button>Enregistrer</button>}
      >
        <p>Contenu de la fenêtre.</p>
      </Modal>
    </>
  );
}

describe("Modal", () => {
  it("a pour nom accessible son titre et décrit la fenêtre", () => {
    render(<ModalHarness />);
    fireEvent.click(screen.getByRole("button", { name: "Ouvrir la fenêtre" }));

    const dialog = screen.getByRole("dialog", { name: "Modifier la commune" });
    expect(dialog).toHaveAccessibleDescription(
      "Les changements sont enregistrés à la validation.",
    );
  });

  it("place le focus dans la fenêtre à l'ouverture", () => {
    render(<ModalHarness />);
    fireEvent.click(screen.getByRole("button", { name: "Ouvrir la fenêtre" }));

    const dialog = screen.getByRole("dialog");
    expect(dialog.contains(document.activeElement)).toBe(true);
  });

  it("Échap ferme la fenêtre et rend le focus au déclencheur", async () => {
    render(<ModalHarness />);
    const trigger = screen.getByRole("button", { name: "Ouvrir la fenêtre" });
    trigger.focus();
    fireEvent.click(trigger);

    expect(screen.getByRole("dialog")).toBeInTheDocument();
    fireEvent.keyDown(document, { key: "Escape" });

    await waitFor(() => {
      expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    });
    await waitFor(() => {
      expect(document.activeElement).toBe(trigger);
    });
  });

  it("le bouton Fermer du titre ferme la fenêtre", () => {
    const onClose = vi.fn();
    render(<ModalHarness onClose={onClose} />);
    fireEvent.click(screen.getByRole("button", { name: "Ouvrir la fenêtre" }));

    fireEvent.click(screen.getByRole("button", { name: "Fermer" }));
    expect(onClose).toHaveBeenCalledOnce();
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("le contenu long défile en interne et la fenêtre est plein écran sur mobile", () => {
    render(<ModalHarness />);
    fireEvent.click(screen.getByRole("button", { name: "Ouvrir la fenêtre" }));

    const dialog = screen.getByRole("dialog");
    expect(dialog).toHaveClass("max-h-[85dvh]");
    expect(dialog).toHaveClass("max-sm:h-dvh");
    expect(dialog).toHaveClass("max-sm:max-w-none");
  });

  it("la taille règle la largeur sur bureau", () => {
    render(<ModalHarness size="lg" />);
    fireEvent.click(screen.getByRole("button", { name: "Ouvrir la fenêtre" }));
    expect(screen.getByRole("dialog")).toHaveClass("sm:max-w-2xl");
  });

  it("sans description, aria-describedby n'est pas posé", () => {
    function NoDescription() {
      const [open, setOpen] = useState(true);
      return (
        <Modal open={open} onClose={() => setOpen(false)} title="Titre seul">
          <p>Contenu.</p>
        </Modal>
      );
    }
    render(<NoDescription />);
    expect(screen.getByRole("dialog")).not.toHaveAttribute(
      "aria-describedby",
    );
  });

  it("aucune violation axe", async () => {
    render(<ModalHarness />);
    fireEvent.click(screen.getByRole("button", { name: "Ouvrir la fenêtre" }));
    expect(await axeViolations()).toEqual([]);
  });
});
