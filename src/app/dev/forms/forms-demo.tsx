"use client";

import { useState, type ReactNode } from "react";

import { Checkbox, type CheckboxState } from "@/components/forms/checkbox";
import { getFieldError } from "@/components/forms/field-error";
import { PasswordField } from "@/components/forms/password-field";
import { Radio, RadioGroup } from "@/components/forms/radio-group";
import { SelectField, type SelectOption } from "@/components/forms/select-field";
import { TextArea } from "@/components/forms/text-area";
import { TextField } from "@/components/forms/text-field";
import { Toggle } from "@/components/forms/toggle";
import { Button } from "@/components/ui/button";
import { applyFailedRules, evaluatePasswordRules } from "@/lib/auth/password-rules";
import { mockMunicipalities } from "@/mocks";
import type { ApiError } from "@/types/domain";
import { ROLES, roleLabels } from "@/types/roles";

/** Les 32 communes fictives des fixtures (#5 G0.B). */
const communes: SelectOption[] = mockMunicipalities.map((municipality) => ({
  value: municipality.code,
  label: municipality.name,
}));

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

/** Réponse 422 simulée de `POST /auth/password-reset/confirm`. */
const DEMO_FAILED_RULES = ["min_length", "uppercase", "digit", "special"];

/** 4 000 caractères : limite de `text` sur `POST /requests/{id}/details-reply`. */
const DETAILS_REPLY_MAX_LENGTH = 4000;

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

  const [apiError, setApiError] = useState<ApiError | null>(
    null,
  );
  const [apiEmail, setApiEmail] = useState("marie.dupont@");
  const [apiCommune, setApiCommune] = useState<string>();

  // G2.A
  const [loginPassword, setLoginPassword] = useState("");
  const [newPassword, setNewPassword] = useState("aubrelle");
  const [validPassword, setValidPassword] = useState("Aubrelle-2026");
  const [errorPassword, setErrorPassword] = useState("aubrelle");

  const [emptyText, setEmptyText] = useState("");
  const [filledText, setFilledText] = useState(
    "Le logement situé au 12 rue des Tilleuls est inoccupé depuis 2023.",
  );
  const [errorText, setErrorText] = useState("");
  const [fullText, setFullText] = useState("Réponse complète.".padEnd(200, "."));

  const [visibility, setVisibility] = useState<string>();
  const [period, setPeriod] = useState("year");
  const [errorVisibility, setErrorVisibility] = useState<string>();

  const [notifications, setNotifications] = useState<CheckboxState>(false);
  const [newsletter, setNewsletter] = useState<CheckboxState>(true);
  const [allCommunes, setAllCommunes] = useState<CheckboxState>("indeterminate");
  const [terms, setTerms] = useState<CheckboxState>(false);

  const [mapLayer, setMapLayer] = useState(false);
  const [alerts, setAlerts] = useState(true);
  const [accountActive, setAccountActive] = useState(true);
  const [accountPending, setAccountPending] = useState(false);

  function toggleAccount(next: boolean) {
    // Simule un appel serveur de 2 s (ex. PATCH du statut du compte).
    setAccountPending(true);
    window.setTimeout(() => {
      setAccountActive(next);
      setAccountPending(false);
    }, 2000);
  }

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
          Tous les états de TextField, Select, PasswordField, TextArea,
          RadioGroup, Checkbox et Toggle. L’état « focus » et les états
          ouverts se voient au clavier : Tab pour avancer, Entrée, Espace ou
          les flèches pour ouvrir une liste, Échap pour la fermer ; flèches
          dans un groupe radio, Espace sur une case ou un interrupteur.
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

      <DemoSection id="passwordfield" title="PasswordField">
        <PasswordField
          label="Mot de passe (connexion)"
          name="login-password"
          autoComplete="current-password"
          value={loginPassword}
          onChange={setLoginPassword}
          required
        />
        <PasswordField
          label="Nouveau mot de passe (règles échouées)"
          name="new-password"
          autoComplete="new-password"
          value={newPassword}
          onChange={setNewPassword}
          rules={evaluatePasswordRules(newPassword)}
          hint="Règles par défaut (recommandation CNIL), en attendant celles du back."
        />
        <PasswordField
          label="Nouveau mot de passe (règles satisfaites)"
          name="valid-password"
          autoComplete="new-password"
          value={validPassword}
          onChange={setValidPassword}
          rules={evaluatePasswordRules(validPassword)}
        />
        <PasswordField
          label="Nouveau mot de passe (erreur 422)"
          name="error-password"
          autoComplete="new-password"
          value={errorPassword}
          onChange={setErrorPassword}
          rules={applyFailedRules(
            evaluatePasswordRules(errorPassword),
            DEMO_FAILED_RULES,
          )}
          error="Le mot de passe ne respecte pas toutes les règles."
          hint="Simulation : règles renvoyées en échec par le serveur (failedRules)."
        />
        <PasswordField
          label="Mot de passe (désactivé)"
          name="disabled-password"
          value="motdepasse"
          onChange={() => {}}
          disabled
        />
      </DemoSection>

      <DemoSection id="textarea" title="TextArea">
        <TextArea
          label="Vide"
          name="empty-text"
          value={emptyText}
          onChange={setEmptyText}
          placeholder="Ex. : Le logement est vacant depuis 2023."
        />
        <TextArea
          label="Précisions (compteur)"
          name="details"
          value={filledText}
          onChange={setFilledText}
          maxLength={DETAILS_REPLY_MAX_LENGTH}
          showCounter
          hint="4 000 caractères maximum. Le reste est annoncé près de la limite."
        />
        <TextArea
          label="Réponse"
          name="error-text"
          value={errorText}
          onChange={setErrorText}
          required
          error="Saisissez votre réponse au service Habitat."
        />
        <TextArea
          label="Limite atteinte"
          name="full-text"
          value={fullText}
          onChange={setFullText}
          maxLength={200}
          showCounter
        />
        <TextArea
          label="Désactivé"
          name="disabled-text"
          value="Texte non modifiable"
          onChange={() => {}}
          disabled
        />
        <TextArea
          label="Lecture seule"
          name="readonly-text"
          value="Demande transmise le 12 novembre 2026 au service Habitat."
          onChange={() => {}}
          readOnly
        />
      </DemoSection>

      <DemoSection id="radiogroup" title="RadioGroup">
        <RadioGroup
          legend="Visibilité (aucun choix)"
          name="visibility"
          value={visibility}
          onChange={setVisibility}
          hint="Qui pourra lire ce rapport une fois publié."
        >
          <Radio value="internal" label="Service Habitat uniquement" />
          <Radio
            value="elected"
            label="Élus de la commune"
            description="Le maire et les élus communaux."
          />
          <Radio value="public" label="Public" />
        </RadioGroup>
        <RadioGroup
          legend="Période (choix actif, option désactivée)"
          name="period"
          value={period}
          onChange={setPeriod}
        >
          <Radio value="year" label="Dernière année" />
          <Radio value="five-years" label="5 dernières années" />
          <Radio
            value="all"
            label="Depuis 2010"
            description="Données antérieures non encore publiées."
            disabled
          />
        </RadioGroup>
        <RadioGroup
          legend="Visibilité du rapport"
          name="error-visibility"
          value={errorVisibility}
          onChange={setErrorVisibility}
          required
          error="Choisissez la visibilité du rapport."
          orientation="horizontal"
        >
          <Radio value="internal" label="Interne" />
          <Radio value="public" label="Public" />
        </RadioGroup>
        <RadioGroup
          legend="Groupe désactivé"
          name="disabled-group"
          value="internal"
          onChange={() => {}}
          disabled
        >
          <Radio value="internal" label="Interne" />
          <Radio value="public" label="Public" />
        </RadioGroup>
      </DemoSection>

      <DemoSection id="checkbox" title="Checkbox">
        <div className="flex flex-col gap-2">
          <Checkbox
            label="Décochée"
            checked={notifications}
            onChange={setNotifications}
          />
          <Checkbox
            label="Cochée"
            checked={newsletter}
            onChange={setNewsletter}
            description="Un e-mail à chaque nouvelle demande."
          />
          <Checkbox
            label="Toutes les communes (indéterminée)"
            checked={allCommunes}
            onChange={setAllCommunes}
            description="Une partie seulement des communes est sélectionnée."
          />
        </div>
        <div className="flex flex-col gap-2">
          <Checkbox
            label="J’ai vérifié les sources citées"
            checked={terms}
            onChange={setTerms}
            required
            error="Cochez cette case pour publier le rapport."
          />
          <Checkbox
            label="Désactivée (cochée)"
            checked
            onChange={() => {}}
            disabled
          />
          <Checkbox
            label="Désactivée (décochée)"
            checked={false}
            onChange={() => {}}
            disabled
          />
        </div>
      </DemoSection>

      <DemoSection id="toggle" title="Toggle">
        <div className="flex flex-col gap-2">
          <Toggle
            label="Afficher la couche DPE"
            checked={mapLayer}
            onChange={setMapLayer}
          />
          <Toggle
            label="Alertes par e-mail"
            checked={alerts}
            onChange={setAlerts}
            description="Prévenu quand une demande vous est attribuée."
          />
          <Toggle
            label="Compte actif (enregistrement 2 s)"
            checked={accountActive}
            onChange={toggleAccount}
            pending={accountPending}
            description="Simule un appel serveur : les clics sont ignorés pendant l’enregistrement."
          />
        </div>
        <div className="flex flex-col gap-2">
          <Toggle
            label="En attente (permanent)"
            checked
            onChange={() => {}}
            pending
          />
          <Toggle
            label="En erreur"
            checked={false}
            onChange={() => {}}
            error="Le changement n’a pas été enregistré. Réessayez."
          />
          <Toggle
            label="Désactivé"
            checked={false}
            onChange={() => {}}
            disabled
          />
        </div>
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
