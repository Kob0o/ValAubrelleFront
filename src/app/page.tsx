import { BrandSignature } from "@/components/layout/brand-signature";
import { Button } from "@/components/ui/button";
import { getActiveTheme } from "@/theme/themes";

const swatches = [
  {
    name: "Vert Aubrelle",
    token: "--color-primary",
    usage: "Boutons, liens, en-têtes",
  },
  {
    name: "Vert forêt",
    token: "--color-primary-strong",
    usage: "Titres, fonds foncés",
  },
  {
    name: "Anthracite",
    token: "--color-text",
    usage: "Texte courant",
  },
  {
    name: "Gris ardoise",
    token: "--color-text-muted",
    usage: "Textes secondaires",
  },
  {
    name: "Brume",
    token: "--color-surface-alt",
    usage: "Fonds de section",
  },
  {
    name: "Vert prairie",
    token: "--color-accent",
    usage: "Accent décoratif, jamais pour du texte",
  },
] as const;

const states = [
  { name: "Information", token: "--color-info" },
  { name: "Succès", token: "--color-success" },
  { name: "Avertissement", token: "--color-warning" },
  { name: "Erreur", token: "--color-danger" },
] as const;

const dataSteps = [1, 2, 3, 4, 5] as const;

export default function HomePage() {
  const theme = getActiveTheme();

  return (
    <main id="contenu" className="mx-auto flex w-full max-w-5xl flex-1 flex-col gap-10 px-6 py-10">
      <header className="flex flex-col gap-3 border-t-4 border-[var(--color-accent)] pt-4">
        <p className="text-base font-semibold text-[var(--color-primary)]">
          Observatoire de l’habitat
        </p>
        <h1 className="text-4xl font-extrabold tracking-tight text-[var(--color-primary-strong)]">
          Socle d’interface
        </h1>
        <p className="max-w-2xl text-base text-[var(--color-text)]">
          Thème {theme.label}. Les composants lisent uniquement les variables
          CSS du thème actif.
        </p>
      </header>

      <section aria-labelledby="couleurs" className="flex flex-col gap-4">
        <h2 id="couleurs" className="text-2xl font-semibold text-[var(--color-primary-strong)]">
          Couleurs de la charte
        </h2>
        <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {swatches.map((swatch) => (
            <li
              key={swatch.token}
              className="overflow-hidden rounded-[var(--radius)] border border-[var(--color-border)] bg-[var(--color-surface)]"
            >
              <div
                className="h-16"
                style={{ backgroundColor: `var(${swatch.token})` }}
              />
              <div className="flex flex-col gap-1 px-4 py-3">
                <p className="font-semibold text-[var(--color-text)]">{swatch.name}</p>
                <p className="text-base text-[var(--color-text-muted)]">
                  {theme.cssVariables[swatch.token]} · {swatch.usage}
                </p>
              </div>
            </li>
          ))}
        </ul>
      </section>

      <section aria-labelledby="etats" className="flex flex-col gap-4 rounded-[var(--radius)] bg-[var(--color-surface-alt)] p-6">
        <h2 id="etats" className="text-2xl font-semibold text-[var(--color-primary-strong)]">
          Couleurs d’état
        </h2>
        <p className="text-base text-[var(--color-text)]">
          Provisoires, à faire valider par le service Communication. Le libellé
          porte l’information, pas la couleur seule.
        </p>
        <ul className="grid gap-3 sm:grid-cols-2">
          {states.map((state) => (
            <li key={state.token} className="text-base font-semibold" style={{ color: `var(${state.token})` }}>
              {state.name}
            </li>
          ))}
        </ul>
      </section>

      <section aria-labelledby="donnees" className="flex flex-col gap-4">
        <h2 id="donnees" className="text-2xl font-semibold text-[var(--color-primary-strong)]">
          Palette de données
        </h2>
        <p className="max-w-2xl text-base text-[var(--color-text)]">
          Échelle séquentielle d’une seule teinte. Elle n’oppose pas le rouge
          et le vert pour dire bon ou mauvais.
        </p>
        <ol className="grid grid-cols-5 gap-3">
          {dataSteps.map((step) => (
            <li key={step} className="flex flex-col gap-2">
              <div
                className="h-12 rounded-[var(--radius)] border border-[var(--color-border)]"
                style={{ backgroundColor: `var(--data-seq-${step})` }}
              />
              <p className="text-base text-[var(--color-text)]">Palier {step}</p>
            </li>
          ))}
        </ol>
      </section>

      <section aria-labelledby="typo" className="flex flex-col gap-3">
        <h2 id="typo" className="text-2xl font-semibold text-[var(--color-primary-strong)]">
          Typographie Inter
        </h2>
        <p className="text-3xl font-extrabold text-[var(--color-text)]">
          ExtraBold · titres
        </p>
        <p className="text-xl font-semibold text-[var(--color-text)]">
          SemiBold · intertitres et boutons
        </p>
        <p className="text-base font-normal text-[var(--color-text)]">
          Regular · texte courant, 16 px minimum.
        </p>
      </section>

      <section aria-labelledby="action" className="flex flex-col items-start gap-4">
        <h2 id="action" className="text-2xl font-semibold text-[var(--color-primary-strong)]">
          Action principale
        </h2>
        <Button type="button">Consulter l’observatoire</Button>
        <a
          className="inline-flex min-h-11 items-center text-base font-semibold text-[var(--color-primary)] underline-offset-4 hover:underline"
          href="#signature"
        >
          Lire la signature
        </a>
      </section>

      <footer id="signature" className="border-t border-[var(--color-border)] pt-6">
        <BrandSignature />
      </footer>
    </main>
  );
}
