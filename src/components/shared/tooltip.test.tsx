import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Settings } from "lucide-react";
import { afterEach, beforeAll, describe, expect, it } from "vitest";

import { IconButton } from "@/components/shared/icon-button";
import { Tooltip } from "@/components/shared/tooltip";
import { charter } from "@/theme/tokens";
import { contrastRatio, TEXT_CONTRAST_MINIMUM } from "@/theme/contrast";

// Radix positionne l'info-bulle avec ResizeObserver, absent de jsdom.
beforeAll(() => {
  globalThis.ResizeObserver ??= class {
    observe() {}
    unobserve() {}
    disconnect() {}
  };
});

afterEach(() => {
  cleanup();
});

describe("Tooltip", () => {
  it("s'ouvre au focus clavier et se ferme avec Échap", async () => {
    const user = userEvent.setup();
    render(
      <Tooltip content="Valeur masquée pour protéger les ménages">
        <button type="button">Masquée</button>
      </Tooltip>,
    );

    await user.tab();
    expect(await screen.findByRole("tooltip")).toHaveTextContent(
      "Valeur masquée pour protéger les ménages",
    );

    await user.keyboard("{Escape}");
    expect(screen.queryByRole("tooltip")).not.toBeInTheDocument();
  });

  it("s'ouvre au toucher sur le déclencheur", async () => {
    const user = userEvent.setup();
    render(
      <Tooltip content="Aide">
        <button type="button">Déclencheur</button>
      </Tooltip>,
    );

    await user.pointer({
      keys: "[TouchA]",
      target: screen.getByRole("button", { name: "Déclencheur" }),
    });
    expect(await screen.findByRole("tooltip")).toHaveTextContent("Aide");
  });

  it("utilise un fond Anthracite et un texte blanc contrastés", () => {
    expect(contrastRatio(charter.onPrimary, charter.text)).toBeGreaterThanOrEqual(
      TEXT_CONTRAST_MINIMUM,
    );
  });
});

describe("IconButton avec tooltip", () => {
  it("affiche son libellé en info-bulle au focus", async () => {
    const user = userEvent.setup();
    render(
      <IconButton label="Ouvrir les paramètres" tooltip>
        <Settings aria-hidden />
      </IconButton>,
    );

    await user.tab();
    expect(screen.getByRole("button", { name: "Ouvrir les paramètres" })).toHaveFocus();
    expect(await screen.findByRole("tooltip")).toHaveTextContent("Ouvrir les paramètres");
  });
});
