"use client";

import { useState, type ReactNode } from "react";

import { getFieldError } from "@/components/forms/field-error";
import { SelectField, type SelectOption } from "@/components/forms/select-field";
import { TextField } from "@/components/forms/text-field";
import { Button } from "@/components/ui/button";

/** Quelques communes fictives ; les 32 fixtures typées arrivent avec #5 (G0.B). */
const communes: SelectOption[] = [
  { value: "99001", label: "Aubrelle-sur-Loue" },
  { value: "99002", label: "Bois-Fleuri" },
  { value: "99003", label: "Champvert" },
  { value: "99004", label: "Les Granges-Hautes" },
  { value: "99005", label: "Montclair-d'Aubrelle" },
  { value: "99006", label: "Saint-Aubin-des-Prés" },
  { value: "99007", label: "Val-Mousseux", disabled: true },
  { value: "99008", label: "Vernay-le-Haut" },
];

const roles: SelectOption[] = [
  { value: "mayor", label: "Maire" },
  { value: "community_councillor", label: "Élu communautaire" },
  { value: "housing_officer", label: "Agent Habitat" },
  { value: "admin", label: "Administrateur" },
];

/** Réponse 422 simulée, au format `ApiError` du contrat. */
const validationError = {
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

  const [role, setRole] = useState<string>();
  const [selectedRole, setSelectedRole] = useState("housing_officer");
  const [errorRole, setErrorRole] = useState<string>();
  const [commune, setCommune] = useState<string>();

  const [apiError, setApiError] = useState<typeof validationError | null>(
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
        <p className="text-base font-semibold text-[var(--color-primary)]">
          Page de démonstration — masquée en production
        </p>
        <h1 className="text-4xl font-extrabold tracking-tight text-[var(--color-primary-strong)]">
          Champs de saisie et de choix
        </h1>
        <p className="max-w-2xl text-base text-[var(--color-text)]">
          Tous les états de TextField et Select. L’état « focus » et les états
          ouverts se voient au clavier : Tab pour avancer, Entrée, Espace ou
          les flèches pour ouvrir une liste, Échap pour la fermer.
        </p>
        <p className="text-base text-[var(--color-text-muted)]">
          Les champs marqués d’un astérisque (*) sont obligatoires.
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
        />
        <TextField
          label="Lecture seule"
          name="readonly"
          value="Communauté d’agglomération du Val d’Aubrelle"
          onChange={() => {}}
          readOnly
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
          autoComplete="current-password"
          value={password}
          onChange={setPassword}
          required
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
          hint="Tapez pour filtrer la liste. Val-Mousseux est indisponible."
        />
      </DemoSection>

      <section aria-labelledby="api" className="flex flex-col gap-6">
        <h2
          id="api"
          className="text-2xl font-semibold text-[var(--color-primary-strong)]"
        >
          Erreurs renvoyées par l’API (422)
        </h2>
        <p className="max-w-2xl text-base text-[var(--color-text)]">
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
