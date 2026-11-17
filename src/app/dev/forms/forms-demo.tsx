"use client";

import { useState, type ReactNode } from "react";

import { getFieldError } from "@/components/forms/field-error";
import {
  MultiSelect,
  type MultiSelectOption,
} from "@/components/forms/multi-select";
import { SelectField, type SelectOption } from "@/components/forms/select-field";
import { TextField } from "@/components/forms/text-field";
import { Button } from "@/components/ui/button";
import { mockMunicipalities } from "@/mocks";
import type { ApiError } from "@/types/domain";
import { ROLES, roleLabels } from "@/types/roles";

const communes: SelectOption[] = mockMunicipalities.map((municipality) => ({
  value: municipality.code,
  label: municipality.name,
}));

const multiCommunes: MultiSelectOption[] = mockMunicipalities.map(
  (municipality) => ({
    value: municipality.code,
    label: municipality.name,
  }),
);

const groupedCommunes: MultiSelectOption[] = mockMunicipalities.map(
  (municipality, index) => ({
    value: municipality.code,
    label: municipality.name,
    group: index < 16 ? "Secteur nord" : "Secteur sud",
  }),
);

function formatCommunesCount(count: number): string {
  if (count === 0) return "Aucune commune sélectionnée";
  if (count === 1) return "1 commune sélectionnée";
  return `${count} communes sélectionnées`;
}

const roles: SelectOption[] = ROLES.map((role) => ({
  value: role,
  label: roleLabels[role],
}));

/** Réponse 422 simulée, au format `ApiError` du contrat. */
const validationError: ApiError = {
  httpStatus: 422,
  code: "VALIDATION_FAILED",
  message: "Certains champs sont invalides.",
  fields: {
    email: "Saisissez une adresse e-mail valide, par exemple nom@commune.fr.",
    municipality: "Choisissez la commune concernée par la demande.",
  },
};

function DemoSection({
  id,
  title,
  children,
}: {
  id: string;
  title: string;
  children: ReactNode;
}) {
  return (
    <section aria-labelledby={id} className="flex flex-col gap-6">
      <h2
        id={id}
        className="text-2xl font-semibold text-[var(--color-primary-strong)]"
      >
        {title}
      </h2>
      <div className="grid gap-8 md:grid-cols-2">{children}</div>
    </section>
  );
}

export function FormsDemo() {
  const [empty, setEmpty] = useState("");
  const [filled, setFilled] = useState("Marie Dupont");
  const [invalid, setInvalid] = useState("marie.dupont@");
  const [required, setRequired] = useState("");
  const [summary, setSummary] = useState("Logements vacants en centre-bourg");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirmation, setPasswordConfirmation] = useState("");
  const passwordMismatch =
    passwordConfirmation !== "" && passwordConfirmation !== password;

  const [role, setRole] = useState<string>();
  const [selectedRole, setSelectedRole] = useState("housing_officer");
  const [errorRole, setErrorRole] = useState<string>();
  const [commune, setCommune] = useState<string>();

  const [multiEmpty, setMultiEmpty] = useState<string[]>([]);
  const [multiFilled, setMultiFilled] = useState<string[]>([
    "59230",
    "59231",
    "59251",
    "59232",
  ]);
  const [multiMax, setMultiMax] = useState<string[]>(["59230", "59231"]);
  const [multiGrouped, setMultiGrouped] = useState<string[]>([]);
  const [multiError, setMultiError] = useState<string[]>([]);

  const [apiError, setApiError] = useState<ApiError | null>(
    null,
  );
  const [apiEmail, setApiEmail] = useState("marie.dupont@");
  const [apiCommune, setApiCommune] = useState<string>();

  return (
    <main
      id="contenu"
      className="mx-auto flex w-full max-w-5xl flex-1 flex-col gap-12 px-6 py-10"
    >
      <header className="flex flex-col gap-3 border-t-4 border-[var(--color-accent)] pt-4">
        <p className="text-base font-semibold text-primary">
          Page de démonstration — masquée en production
        </p>
        <h1 className="text-4xl font-extrabold tracking-tight text-[var(--color-primary-strong)]">
          Champs de saisie et de choix
        </h1>
        <p className="max-w-2xl text-base text-foreground">
          Tous les états de TextField, Select et MultiSelect. L’état « focus »
          et les états ouverts se voient au clavier : Tab pour avancer, Entrée,
          Espace ou les flèches pour ouvrir une liste, Échap pour la fermer.
        </p>
        <p className="text-base text-muted-foreground">
          Les champs obligatoires portent le badge « Obligatoire ». L’aide
          d’un champ s’affiche au survol, au focus ou au toucher de son icône
          d’information. Toutes les données affichées sont fictives.
        </p>
      </header>

      <DemoSection id="textfield" title="TextField">
        <TextField
          label="Vide"
          name="empty"
          value={empty}
          onChange={setEmpty}
          placeholder="Ex. : Marie Dupont"
        />
        <TextField
          label="Saisi"
          name="filled"
          value={filled}
          onChange={setFilled}
        />
        <TextField
          label="Adresse e-mail"
          name="invalid"
          type="email"
          value={invalid}
          onChange={setInvalid}
          error="Saisissez une adresse e-mail valide, par exemple nom@commune.fr."
        />
        <TextField
          label="Obligatoire avec aide"
          name="required"
          value={required}
          onChange={setRequired}
          required
          hint="Nom tel qu’il apparaît sur votre mandat."
          placeholder="Ex. : Marie Dupont"
        />
        <TextField
          label="Désactivé"
          name="disabled"
          value="Valeur non modifiable"
          onChange={() => {}}
          disabled
          hint="Champ inactif tant que le rôle n’est pas choisi."
        />
        <TextField
          label="Lecture seule"
          name="readonly"
          value="Communauté d’agglomération du Val d’Aubrelle"
          onChange={() => {}}
          readOnly
          hint="Défini par l’administrateur, non modifiable ici."
        />
        <TextField
          label="Objet de la demande"
          name="summary"
          value={summary}
          onChange={setSummary}
          maxLength={80}
          showCounter
          hint="Une phrase courte, 80 caractères maximum."
        />
        <TextField
          label="E-mail"
          name="email"
          type="email"
          autoComplete="email"
          value={email}
          onChange={setEmail}
          required
        />
        <TextField
          label="Mot de passe"
          name="password"
          type="password"
          autoComplete="new-password"
          value={password}
          onChange={setPassword}
          required
          hint="12 caractères minimum (règle fictive de démonstration)."
        />
        <TextField
          label="Confirmer le mot de passe"
          name="password-confirmation"
          type="password"
          autoComplete="new-password"
          value={passwordConfirmation}
          onChange={setPasswordConfirmation}
          required
          error={
            passwordMismatch
              ? "Les deux mots de passe ne correspondent pas."
              : undefined
          }
        />
      </DemoSection>

      <DemoSection id="select" title="Select">
        <SelectField
          label="Vide (aucune sélection)"
          options={roles}
          value={role}
          onChange={setRole}
          placeholder="Choisir un rôle"
        />
        <SelectField
          label="Sélectionné"
          options={roles}
          value={selectedRole}
          onChange={setSelectedRole}
        />
        <SelectField
          label="Rôle"
          options={roles}
          value={errorRole}
          onChange={setErrorRole}
          required
          error="Choisissez le rôle du compte."
        />
        <SelectField
          label="Désactivé"
          options={roles}
          value="mayor"
          onChange={() => {}}
          disabled
        />
        <SelectField
          label="Sans option"
          options={[]}
          value={undefined}
          onChange={() => {}}
          hint="Aucune commune n’est rattachée à votre périmètre."
        />
        <SelectField
          label="Commune (recherche)"
          options={communes}
          value={commune}
          onChange={setCommune}
          searchable
          placeholder="Choisir une commune"
          hint="Tapez pour filtrer les 32 communes."
        />
      </DemoSection>

      <DemoSection id="multiselect" title="MultiSelect">
        <MultiSelect
          label="Communes (vide)"
          options={multiCommunes}
          value={multiEmpty}
          onChange={setMultiEmpty}
          placeholder="Choisir des communes"
          hint="Recherche accent-insensible sur les 32 communes."
          formatSelectionCount={formatCommunesCount}
        />
        <MultiSelect
          label="Communes (pastilles)"
          options={multiCommunes}
          value={multiFilled}
          onChange={setMultiFilled}
          hint="Au-delà de 3 pastilles, un compteur « + N autres » apparaît."
          formatSelectionCount={formatCommunesCount}
        />
        <MultiSelect
          label="Communes (max 3)"
          options={multiCommunes}
          value={multiMax}
          onChange={setMultiMax}
          max={3}
          hint="Les options restantes sont désactivées à la limite."
          formatSelectionCount={formatCommunesCount}
        />
        <MultiSelect
          label="Communes groupées"
          options={groupedCommunes}
          value={multiGrouped}
          onChange={setMultiGrouped}
          placeholder="Choisir par secteur"
          formatSelectionCount={formatCommunesCount}
        />
        <MultiSelect
          label="Communes (erreur)"
          options={multiCommunes}
          value={multiError}
          onChange={setMultiError}
          required
          error="Choisissez au moins une commune."
          formatSelectionCount={formatCommunesCount}
        />
        <MultiSelect
          label="Communes (désactivé)"
          options={multiCommunes}
          value={["59230", "59231"]}
          onChange={() => {}}
          disabled
          formatSelectionCount={formatCommunesCount}
        />
      </DemoSection>

      <section aria-labelledby="api" className="flex flex-col gap-6">
        <h2
          id="api"
          className="text-2xl font-semibold text-[var(--color-primary-strong)]"
        >
          Erreurs renvoyées par l’API (422)
        </h2>
        <p className="max-w-2xl text-base text-foreground">
          Simulation : les messages viennent de <code>ApiError.fields</code>{" "}
          et sont reliés à chaque champ.
        </p>
        <form
          noValidate
          className="grid gap-8 md:grid-cols-2"
          onSubmit={(event) => {
            event.preventDefault();
            setApiError(validationError);
          }}
        >
          <TextField
            label="E-mail du demandeur"
            name="email"
            type="email"
            value={apiEmail}
            onChange={setApiEmail}
            required
            error={getFieldError(apiError, "email")}
          />
          <SelectField
            label="Commune"
            name="municipality"
            options={communes}
            value={apiCommune}
            onChange={setApiCommune}
            searchable
            required
            error={getFieldError(apiError, "municipality")}
          />
          <div className="flex flex-wrap gap-4 md:col-span-2">
            <Button type="submit">Simuler un 422</Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => setApiError(null)}
            >
              Effacer les erreurs
            </Button>
          </div>
        </form>
      </section>
    </main>
  );
}
