import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";

import {
  getPageCount,
  getPageItems,
  Pagination,
} from "@/components/shared/pagination";

afterEach(() => {
  cleanup();
});

describe("getPageCount", () => {
  it("vaut ceil(total / size)", () => {
    expect(getPageCount(134, 20)).toBe(7);
    expect(getPageCount(140, 20)).toBe(7);
    expect(getPageCount(141, 20)).toBe(8);
    expect(getPageCount(0, 20)).toBe(1);
  });
});

describe("getPageItems", () => {
  it("affiche toutes les pages jusqu'à 7", () => {
    expect(getPageItems(3, 7)).toEqual([1, 2, 3, 4, 5, 6, 7]);
  });

  it("place des ellipses autour de la page courante", () => {
    expect(getPageItems(5, 12)).toEqual([1, "ellipsis", 4, 5, 6, "ellipsis", 12]);
    expect(getPageItems(1, 12)).toEqual([1, 2, 3, 4, 5, "ellipsis", 12]);
    expect(getPageItems(12, 12)).toEqual([1, "ellipsis", 8, 9, 10, 11, 12]);
  });
});

describe("Pagination", () => {
  it("est masquée quand total ≤ size", () => {
    const { container } = render(
      <Pagination page={1} size={20} total={20} onPageChange={vi.fn()} />,
    );
    expect(container).toBeEmptyDOMElement();
  });

  it("ramène une page courante trop grande sur la dernière page", () => {
    const onPageChange = vi.fn();
    render(<Pagination page={9} size={20} total={134} onPageChange={onPageChange} />);
    expect(onPageChange).toHaveBeenCalledWith(7);
  });

  it("annonce la page courante et le nombre de résultats", () => {
    render(<Pagination page={2} size={20} total={134} onPageChange={vi.fn()} />);

    expect(screen.getByRole("navigation", { name: "Pagination" })).toBeInTheDocument();
    const status = screen.getByText("Page 2 sur 7 · 134 résultats");
    expect(status).toHaveAttribute("aria-live", "polite");
    expect(screen.getByRole("button", { name: "Page 2" })).toHaveAttribute(
      "aria-current",
      "page",
    );
  });

  it("désactive Précédent sur la première page et Suivant sur la dernière", () => {
    const { rerender } = render(
      <Pagination page={1} size={20} total={134} onPageChange={vi.fn()} />,
    );
    expect(screen.getByRole("button", { name: "Page précédente" })).toBeDisabled();
    expect(screen.getByRole("button", { name: "Page suivante" })).toBeEnabled();

    rerender(<Pagination page={7} size={20} total={134} onPageChange={vi.fn()} />);
    expect(screen.getByRole("button", { name: "Page précédente" })).toBeEnabled();
    expect(screen.getByRole("button", { name: "Page suivante" })).toBeDisabled();
  });

  it("change de page au clavier et ramène le focus sur la liste", async () => {
    const user = userEvent.setup();
    const onPageChange = vi.fn();
    const target = { current: null as HTMLHeadingElement | null };

    render(
      <>
        <h2 tabIndex={-1} ref={(node) => { target.current = node; }}>
          Demandes
        </h2>
        <Pagination
          page={2}
          size={20}
          total={134}
          onPageChange={onPageChange}
          focusTargetRef={target}
        />
      </>,
    );

    screen.getByRole("button", { name: "Page suivante" }).focus();
    await user.keyboard("{Enter}");

    expect(onPageChange).toHaveBeenCalledWith(3);
    expect(target.current).toHaveFocus();
  });

  it("bloque les boutons pendant le chargement", async () => {
    const user = userEvent.setup();
    const onPageChange = vi.fn();
    render(
      <Pagination page={2} size={20} total={134} onPageChange={onPageChange} loading />,
    );

    expect(screen.getByRole("navigation", { name: "Pagination" })).toHaveAttribute(
      "aria-busy",
      "true",
    );
    for (const button of screen.getAllByRole("button")) {
      expect(button).toBeDisabled();
    }
    await user.click(screen.getByRole("button", { name: "Page 3" }));
    expect(onPageChange).not.toHaveBeenCalled();
  });

  it("propose les tailles 20, 50 et 100 si onSizeChange est fourni", async () => {
    const user = userEvent.setup();
    const onSizeChange = vi.fn();
    render(
      <Pagination
        page={1}
        size={20}
        total={134}
        onPageChange={vi.fn()}
        onSizeChange={onSizeChange}
      />,
    );

    const select = screen.getByLabelText("Résultats par page");
    expect(
      Array.from(select.querySelectorAll("option"), (option) => option.value),
    ).toEqual(["20", "50", "100"]);
    await user.selectOptions(select, "50");
    expect(onSizeChange).toHaveBeenCalledWith(50);
  });
});
