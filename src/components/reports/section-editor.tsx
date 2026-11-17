"use client";

import { useRef, useState, type FormEvent } from "react";
import { CircleAlert } from "lucide-react";

import { getFieldError } from "@/components/forms/field-error";
import { TextArea } from "@/components/forms/text-area";
import { TextField } from "@/components/forms/text-field";
import { CorrelationId } from "@/components/shared/correlation-id";
import { Button } from "@/components/ui/button";
import { useIdempotentSubmit } from "@/hooks/use-idempotent-submit";
import {
  getErrorMessage,
  isServerError,
  isVersionConflict,
  normalizeError,
  type NormalizedApiError,
} from "@/lib/api/errors";
import type { CreateSectionInput } from "@/lib/api/reports";
import type { Decision, Section } from "@/types/domain";

/** maxLength du titre dans createManualReportSection (contrat OpenAPI). */
export const TITLE_MAX_LENGTH = 200;

export type SectionEditorInitial = Required<
  Pick<Section, "id" | "title" | "text" | "version">
>;

type CreateModeProps = {
  /** POST /reports/drafts/{reportId}/sections (createManualReportSection). */
  onCreate: (
    input: CreateSectionInput,
    idempotencyKey: string,
  ) => Promise<unknown>;
  initial?: undefined;
  onUpdate?: undefined;
  onReload?: undefined;
};

type EditModeProps = {
  /**
   * Section existante. Passer `key={initial.id}` pour réinitialiser
   * le formulaire quand la section change.
   */
  initial: SectionEditorInitial;
  /** PATCH /reports/drafts/{reportId}/sections/{sectionId} (reviewReportSection). */
  onUpdate: (sectionId: string, input: Decision) => Promise<unknown>;
  /** Résolution d'un 409 : recharger la dernière version de la section. */
  onReload?: () => void;
  onCreate?: undefined;
};

export type SectionEditorProps = CreateModeProps | EditModeProps;

type FieldErrors = { title?: string; text?: string };

function validate(
  title: string,
  text: string,
  initial?: SectionEditorInitial,
): FieldErrors {
  const errors: FieldErrors = {};
  if (!initial) {
    if (!title.trim()) errors.title = "Saisissez un titre.";
    else if (title.trim().length > TITLE_MAX_LENGTH)
      errors.title = `Le titre ne doit pas dépasser ${TITLE_MAX_LENGTH} caractères.`;
  }
  if (!text.trim()) errors.text = "Saisissez le texte de la section.";
  else if (initial && text === initial.text)
    errors.text = "Modifiez le texte avant d'enregistrer.";
  return errors;
}

/**
 * Message français de l'ErrorNormalizer (jamais le texte serveur),
 * complété selon la règle commune des erreurs (contrat UI/UX §5).
 */
function describeError(error: NormalizedApiError) {
  const base = getErrorMessage(error);
  if (isVersionConflict(error)) return `${base} Votre texte reste affiché ici.`;
  if (error.httpStatus === 422) return base;
  return `${base} Votre saisie est conservée.`;
}

export function SectionEditor(props: SectionEditorProps) {
  const { initial } = props;
  const isEdit = initial !== undefined;

  const [title, setTitle] = useState(initial?.title ?? "");
  const [text, setText] = useState(initial?.text ?? "");
  const [showErrors, setShowErrors] = useState(false);
  const [success, setSuccess] = useState("");
  const titleRef = useRef<HTMLInputElement>(null);
  const textRef = useRef<HTMLTextAreaElement>(null);

  const action = (idempotencyKey: string) =>
    props.initial
      ? props.onUpdate(props.initial.id, {
          status: "edited",
          editedText: text,
          version: props.initial.version,
        })
      : props.onCreate({ title: title.trim(), text }, idempotencyKey);
  const { submit, isSubmitting, error: rawError, reset } =
    useIdempotentSubmit(action);
  const error = rawError ? normalizeError(rawError) : null;

  const errors = validate(title, text, initial);
  const visibleErrors: FieldErrors = {
    title: (showErrors ? errors.title : undefined) ?? getFieldError(error, "title"),
    text: (showErrors ? errors.text : undefined) ?? getFieldError(error, "text"),
  };
  const correlationId =
    error && isServerError(error) ? error.correlationId : undefined;

  function handleChange(update: () => void) {
    update();
    setSuccess("");
    // Saisie modifiée = nouvelle requête : nouvelle Idempotency-Key.
    if (error) reset();
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (isSubmitting) return;
    setShowErrors(true);
    setSuccess("");

    if (errors.title) return titleRef.current?.focus();
    if (errors.text) return textRef.current?.focus();

    const outcome = await submit();
    if (!outcome.ok) return; // erreur : saisie conservée

    setShowErrors(false);
    if (isEdit) {
      setSuccess("Modifications enregistrées.");
    } else {
      setSuccess(`Section « ${title.trim()} » créée.`);
      setTitle("");
      setText("");
    }
  }

  return (
    <form
      noValidate
      onSubmit={handleSubmit}
      aria-busy={isSubmitting || undefined}
      aria-label={isEdit ? "Modifier la section" : "Nouvelle section"}
      className="flex flex-col gap-4"
    >
      <TextField
        ref={titleRef}
        label="Titre de la section"
        name="title"
        required={!isEdit}
        readOnly={isEdit}
        maxLength={TITLE_MAX_LENGTH}
        hint={
          isEdit
            ? "Le titre d'une section existante n'est pas modifiable."
            : undefined
        }
        value={title}
        error={visibleErrors.title}
        onChange={(value) => handleChange(() => setTitle(value))}
      />

      <TextArea
        ref={textRef}
        label="Texte"
        name="text"
        required
        hint="Mise en forme Markdown acceptée : titres, listes, gras."
        value={text}
        error={visibleErrors.text}
        onChange={(value) => handleChange(() => setText(value))}
      />

      {error ? (
        <div
          role="alert"
          className="flex flex-col gap-2 rounded-[var(--radius)] border-2 border-[var(--color-danger)] px-3 py-2 text-base text-[var(--color-danger)]"
        >
          <p className="flex items-start gap-2 font-semibold">
            <CircleAlert aria-hidden="true" className="mt-0.5 size-5 shrink-0" />
            {describeError(error)}
          </p>
          {correlationId ? <CorrelationId id={correlationId} /> : null}
          {isVersionConflict(error) && props.onReload ? (
            <div>
              <Button type="button" variant="secondary" onClick={props.onReload}>
                Recharger la section
              </Button>
            </div>
          ) : null}
        </div>
      ) : null}

      <p role="status" className="text-base text-[var(--color-success)]">
        {success}
      </p>

      <div>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting
            ? "Enregistrement…"
            : isEdit
              ? "Enregistrer les modifications"
              : "Créer la section"}
        </Button>
      </div>
    </form>
  );
}
