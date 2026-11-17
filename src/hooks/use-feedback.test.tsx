import {
  act,
  cleanup,
  render,
  renderHook,
  screen,
  within,
} from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { toast } from "sonner";

import { Toaster } from "@/components/ui/sonner";
import { useFeedback } from "@/hooks/use-feedback";
import { buildApiError, errorMessages } from "@/lib/api/errors";

const CORRELATION_ID = "5f0c8a52-2f5e-4c1b-9d43-0e9f0b1a7c11";

function setup() {
  render(<Toaster theme="light" />);
  return renderHook(() => useFeedback()).result.current;
}

afterEach(() => {
  act(() => {
    toast.dismiss();
  });
  cleanup();
});

describe("useFeedback", () => {
  it("garde la même API d'un rendu à l'autre", () => {
    const { result, rerender } = renderHook(() => useFeedback());
    const first = result.current;
    rerender();
    expect(result.current).toBe(first);
  });

  it("affiche un succès avec son texte et une action", async () => {
    const feedback = setup();
    const onClick = vi.fn();

    act(() => {
      feedback.success("Demande envoyée au service Habitat.", {
        action: { label: "Voir la demande", onClick },
      });
    });

    expect(await screen.findByText("Demande envoyée au service Habitat.")).toBeInTheDocument();
    act(() => {
      screen.getByRole("button", { name: "Voir la demande" }).click();
    });
    expect(onClick).toHaveBeenCalledOnce();
  });

  it("un toast d'erreur est annoncé au lecteur d'écran (role=alert)", async () => {
    const feedback = setup();

    act(() => {
      feedback.error(buildApiError({ httpStatus: 404, body: { code: "NOT_FOUND" } }));
    });

    const alert = await screen.findByRole("alert");
    expect(alert).toHaveTextContent(errorMessages.NOT_FOUND);
    expect(screen.getByRole("region", { name: /Notifications/ })).toHaveAttribute(
      "aria-live",
      "polite",
    );
  });

  it("un 5xx affiche un correlationId copiable et aucun détail technique", async () => {
    const feedback = setup();
    const writeText = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(navigator, "clipboard", {
      configurable: true,
      value: { writeText },
    });

    act(() => {
      feedback.error(
        buildApiError({
          httpStatus: 500,
          body: {
            code: "INTERNAL_ERROR",
            message: "stack trace at db.query",
            correlationId: CORRELATION_ID,
          },
        }),
      );
    });

    const toastElement = (await screen.findByRole("alert")).closest("li")!;
    expect(within(toastElement).getByText(CORRELATION_ID)).toBeInTheDocument();
    expect(toastElement).not.toHaveTextContent("stack trace");

    await act(async () => {
      within(toastElement)
        .getByRole("button", { name: "Copier la référence" })
        .click();
    });
    expect(writeText).toHaveBeenCalledWith(CORRELATION_ID);
    expect(
      within(toastElement).getByRole("button", { name: "Référence copiée" }),
    ).toBeInTheDocument();
  });

  it("n'affiche pas de correlationId hors 5xx", async () => {
    const feedback = setup();

    act(() => {
      feedback.error(
        buildApiError({
          httpStatus: 422,
          body: { code: "VALIDATION_FAILED", correlationId: CORRELATION_ID },
        }),
      );
    });

    await screen.findByRole("alert");
    expect(screen.queryByText(CORRELATION_ID)).not.toBeInTheDocument();
  });

  it("une erreur ne disparaît pas seule et peut être fermée", async () => {
    vi.useFakeTimers();
    try {
      const feedback = setup();
      act(() => {
        feedback.error(buildApiError({ httpStatus: 0 }));
      });
      act(() => {
        vi.advanceTimersByTime(60_000);
      });
      expect(screen.getByRole("alert")).toHaveTextContent(errorMessages.NETWORK_ERROR);
      expect(
        screen.getByRole("button", { name: "Fermer la notification" }),
      ).toBeInTheDocument();
    } finally {
      vi.useRealTimers();
    }
  });
});
