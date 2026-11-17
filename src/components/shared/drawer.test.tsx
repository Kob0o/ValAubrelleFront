import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { useState } from "react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { Drawer } from "@/components/shared/drawer";
import { axeViolations } from "@/test/axe";

const originalMatchMedia = window.matchMedia;

function mockMatchMedia(matches: boolean) {
  Object.defineProperty(window, "matchMedia", {
    configurable: true,
    writable: true,
    value: vi.fn().mockImplementation((query: string) => ({
      matches,
      media: query,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      addListener: vi.fn(),
      removeListener: vi.fn(),
      onchange: null,
      dispatchEvent: vi.fn(),
    })),
  });
}

afterEach(() => {
  Object.defineProperty(window, "matchMedia", {
    configurable: true,
    writable: true,
    value: originalMatchMedia,
  });
});

function DrawerHarness({
  onClose = vi.fn(),
  side,
}: {
  onClose?: () => void;
  side?: "right" | "bottom";
}) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button
        onClick={() => {
          setOpen(true);
        }}
      >
        Ouvrir le panneau
      </button>
      <Drawer
        open={open}
        onClose={() => {
          onClose();
          setOpen(false);
        }}
        title="Filtres"
        description="Affinez la liste des demandes."
        side={side}
        footer={<button>Appliquer</button>}
      >
        <p>Contenu du panneau.</p>
      </Drawer>
    </>
  );
}

describe("Drawer", () => {
  it("a pour nom accessible son titre et une description", () => {
    mockMatchMedia(false);
    render(<DrawerHarness />);
    fireEvent.click(screen.getByRole("button", { name: "Ouvrir le panneau" }));

    const dialog = screen.getByRole("dialog", { name: "Filtres" });
    expect(dialog).toHaveAccessibleDescription(
      "Affinez la liste des demandes.",
    );
  });

  it("place le focus dans le panneau à l'ouverture", () => {
    mockMatchMedia(false);
    render(<DrawerHarness />);
    fireEvent.click(screen.getByRole("button", { name: "Ouvrir le panneau" }));

    const dialog = screen.getByRole("dialog");
    expect(dialog.contains(document.activeElement)).toBe(true);
  });

  it("Échap ferme le panneau et rend le focus au déclencheur", async () => {
    mockMatchMedia(false);
    render(<DrawerHarness />);
    const trigger = screen.getByRole("button", { name: "Ouvrir le panneau" });
    trigger.focus();
    fireEvent.click(trigger);

    fireEvent.keyDown(document, { key: "Escape" });
    await waitFor(() => {
      expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    });
    await waitFor(() => {
      expect(document.activeElement).toBe(trigger);
    });
  });

  it("s'ouvre à droite sur bureau", () => {
    mockMatchMedia(false);
    render(<DrawerHarness />);
    fireEvent.click(screen.getByRole("button", { name: "Ouvrir le panneau" }));
    expect(screen.getByRole("dialog")).toHaveClass("sm:max-w-md");
  });

  it("s'ouvre en bas sur mobile (< 640 px)", () => {
    mockMatchMedia(true);
    render(<DrawerHarness />);
    fireEvent.click(screen.getByRole("button", { name: "Ouvrir le panneau" }));
    expect(screen.getByRole("dialog")).toHaveClass("rounded-t-xl");
  });

  it("la prop side force le côté d'ouverture", () => {
    mockMatchMedia(false);
    render(<DrawerHarness side="bottom" />);
    fireEvent.click(screen.getByRole("button", { name: "Ouvrir le panneau" }));
    expect(screen.getByRole("dialog")).toHaveClass("rounded-t-xl");
  });

  it("aucune violation axe", async () => {
    mockMatchMedia(false);
    render(<DrawerHarness />);
    fireEvent.click(screen.getByRole("button", { name: "Ouvrir le panneau" }));
    expect(await axeViolations()).toEqual([]);
  });
});
