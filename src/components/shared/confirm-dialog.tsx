"use client";

import { useCallback, useRef, useState, type ReactNode } from "react";
import { AlertCircle, Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useRestoreFocus } from "@/hooks/use-restore-focus";

export type ConfirmTone = "default" | "danger";

export interface ConfirmDialogProps {
  /** Contrôle l'ouverture (composant contrôlé par le parent ou useConfirm). */
  open: boolean;
  /** Titre de la confirmation (obligatoire : nom accessible du dialogue). */
  title: string;
  /** Conséquences de l'action, en français clair. */
  description: string;
  /** Libellé explicite de l'action : « Désactiver le compte », pas « OK ». */
  confirmLabel: string;
  /** `danger` : action destructive, bouton en variant destructive, focus initial sur « Annuler ». */
  tone?: ConfirmTone;
  /** Action à confirmer, synchrone ou asynchrone. */
  onConfirm: () => void | Promise<void>;
  /** Annulation (bouton « Annuler », Échap) — ignorée pendant `busy`. */
  onCancel: () => void;
  /** Confirmation en cours : bouton en chargement, fermeture bloquée. */
  busy?: boolean;
  /** Message d'erreur affiché dans le dialogue (celui-ci reste ouvert). */
  error?: string | null;
}

/**
 * Dialogue de confirmation basé sur AlertDialog.
 * Piège à focus, Échap et retour du focus : primitif Radix.
 * En `busy`, la fermeture est bloquée ; une erreur s'affiche dans
 * le dialogue sans le fermer.
 */
export function ConfirmDialog({
  open,
  title,
  description,
  confirmLabel,
  tone = "default",
  onConfirm,
  onCancel,
  busy = false,
  error = null,
}: ConfirmDialogProps) {
  useRestoreFocus(open);

  return (
    <AlertDialog
      open={open}
      onOpenChange={(isOpen) => {
        if (!isOpen && !busy) {
          onCancel();
        }
      }}
    >
      <AlertDialogContent
        className="text-base"
        onEscapeKeyDown={(event) => {
          if (busy) {
            event.preventDefault();
          }
        }}
      >
        <AlertDialogHeader className="place-items-start text-left">
          <AlertDialogTitle className="text-lg font-extrabold text-[var(--color-primary-strong)]">
            {title}
          </AlertDialogTitle>
          <AlertDialogDescription className="text-base">
            {description}
          </AlertDialogDescription>
        </AlertDialogHeader>

        {error ? (
          <div
            role="alert"
            className="flex items-start gap-2 rounded-md border border-[var(--color-danger)]/40 bg-[var(--color-danger)]/10 px-3 py-2"
          >
            <AlertCircle
              aria-hidden="true"
              className="mt-0.5 size-4 shrink-0 text-[var(--color-danger)]"
            />
            <p className="text-sm text-[var(--color-danger)]">{error}</p>
          </div>
        ) : null}

        <AlertDialogFooter>
          <AlertDialogCancel disabled={busy}>Annuler</AlertDialogCancel>
          <Button
            type="button"
            variant={tone === "danger" ? "destructive" : "default"}
            disabled={busy}
            aria-busy={busy}
            onClick={() => {
              void onConfirm();
            }}
          >
            {busy ? (
              <Loader2 aria-hidden="true" className="size-4 animate-spin" />
            ) : null}
            {busy ? "Confirmation en cours…" : confirmLabel}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

export interface ConfirmOptions {
  title: string;
  description: string;
  confirmLabel: string;
  tone?: ConfirmTone;
  /** Action confirmée, synchrone ou asynchrone. */
  onConfirm: () => void | Promise<void>;
}

interface ConfirmState extends ConfirmOptions {
  busy: boolean;
  error: string | null;
}

const CONFIRM_ERROR_MESSAGE =
  "L'action n'a pas abouti. Vérifiez votre connexion puis réessayez.";

/**
 * Dialogue de confirmation piloté par code :
 *
 * ```tsx
 * const { confirm, confirmDialog } = useConfirm();
 * const onDelete = () =>
 *   confirm({
 *     title: "Désactiver le compte",
 *     description: "L'utilisateur ne pourra plus se connecter.",
 *     confirmLabel: "Désactiver le compte",
 *     tone: "danger",
 *     onConfirm: async () => { await deactivate(); },
 *   });
 * return <>{confirmDialog}</>;
 * ```
 *
 * Renvoie `true` si l'action a été confirmée, `false` si annulée.
 * Une erreur de `onConfirm` affiche le message dans le dialogue
 * sans le fermer.
 */
export function useConfirm(): {
  confirm: (options: ConfirmOptions) => Promise<boolean>;
  confirmDialog: ReactNode;
} {
  const [state, setState] = useState<ConfirmState | null>(null);
  const resolverRef = useRef<((confirmed: boolean) => void) | undefined>(
    undefined,
  );

  const settle = useCallback((confirmed: boolean) => {
    resolverRef.current?.(confirmed);
    resolverRef.current = undefined;
    setState(null);
  }, []);

  const confirm = useCallback(
    (options: ConfirmOptions) =>
      new Promise<boolean>((resolve) => {
        resolverRef.current = resolve;
        setState({ ...options, busy: false, error: null });
      }),
    [],
  );

  const handleConfirm = useCallback(async () => {
    setState((current) =>
      current ? { ...current, busy: true, error: null } : current,
    );
    try {
      await state?.onConfirm();
      settle(true);
    } catch {
      setState((current) =>
        current
          ? { ...current, busy: false, error: CONFIRM_ERROR_MESSAGE }
          : current,
      );
    }
  }, [state, settle]);

  const confirmDialog = state ? (
    <ConfirmDialog
      open
      title={state.title}
      description={state.description}
      confirmLabel={state.confirmLabel}
      tone={state.tone}
      busy={state.busy}
      error={state.error}
      onConfirm={handleConfirm}
      onCancel={() => settle(false)}
    />
  ) : null;

  return { confirm, confirmDialog };
}
