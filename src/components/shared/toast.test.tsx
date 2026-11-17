import {
  act,
  cleanup,
  render,
  renderHook,
  screen,
} from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { toast } from "sonner";

import { FeedbackToaster } from "@/components/shared/toast";
import { useFeedback } from "@/hooks/use-feedback";

// Même discipline que use-feedback.test.tsx : fermer les toasts puis
// laisser finir l'animation de sortie avant le démontage.
afterEach(async () => {
  await act(async () => {
    toast.dismiss();
    await new Promise((resolve) => setTimeout(resolve, 300));
  });
  cleanup();
});

describe("FeedbackToaster", () => {
  it("affiche un toast avec un bouton de fermeture accessible", async () => {
    render(<FeedbackToaster />);
    const feedback = renderHookFeedback();

    act(() => {
      feedback.success("Demande enregistrée.");
    });

    expect(
      await screen.findByText("Demande enregistrée."),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Fermer la notification" }),
    ).toBeInTheDocument();
  });

  it("affiche au plus 3 toasts visibles simultanément", async () => {
    render(<FeedbackToaster />);
    const feedback = renderHookFeedback();

    act(() => {
      feedback.info("Notification 1");
      feedback.info("Notification 2");
      feedback.info("Notification 3");
      feedback.info("Notification 4");
    });

    await screen.findByText("Notification 4");
    const visible = document.querySelectorAll('[data-visible="true"]');
    expect(visible.length).toBeLessThanOrEqual(3);
  });
});

function renderHookFeedback() {
  const { result } = renderHook(() => useFeedback());
  return result.current;
}
