import { notFound } from "next/navigation";
import { Settings, Trash2 } from "lucide-react";

import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
  InteractiveCardAction,
} from "@/components/shared/card";
import { IconButton } from "@/components/shared/icon-button";
import { Link } from "@/components/shared/link";
import { Button } from "@/components/ui/button";

import { NavigationDemo } from "./navigation-demo";

export default function DevUiPage() {
  if (process.env.NODE_ENV === "production") {
    notFound();
  }

  return (
    <main
      id="contenu"
      className="mx-auto flex w-full max-w-5xl flex-col gap-10 px-4 py-8"
    >
      <header className="flex flex-col gap-2">
        <h1 className="text-2xl font-extrabold text-[color:var(--color-primary-strong)]">
          Catalogue UI — G1
        </h1>
        <p className="text-base text-muted-foreground">
          Page de démo masquée en production. Variantes ticket :{" "}
          <strong>primary</strong> / <strong>danger</strong> ; alias shadcn :{" "}
          <strong>default</strong> / <strong>destructive</strong> /{" "}
          <strong>outline</strong>.
        </p>
      </header>

      <section className="flex flex-col gap-4" aria-labelledby="buttons-title">
        <h2
          id="buttons-title"
          className="text-xl font-semibold text-[color:var(--color-primary-strong)]"
        >
          Button
        </h2>
        <div className="flex flex-wrap gap-3 rounded-xl bg-white p-4 ring-1 ring-border">
          <Button variant="primary">primary</Button>
          <Button variant="default">default</Button>
          <Button variant="secondary">secondary</Button>
          <Button variant="ghost">ghost</Button>
          <Button variant="danger">Désactiver le compte</Button>
          <Button variant="destructive">destructive</Button>
          <Button variant="outline">outline</Button>
          <Button variant="link">link</Button>
        </div>
        <div className="flex flex-wrap items-center gap-3 rounded-xl bg-[color:var(--color-surface-alt)] p-4 ring-1 ring-border">
          <Button size="sm">sm</Button>
          <Button size="default">default</Button>
          <Button size="md">md</Button>
          <Button size="lg">lg</Button>
          <Button size="icon-sm" aria-label="Icône sm">
            <Settings aria-hidden />
          </Button>
          <Button loading>Enregistrement</Button>
          <Button disabled>Désactivé</Button>
          <Button asChild loading>
            <a href="https://example.com">Aller (asChild loading)</a>
          </Button>
        </div>
        <p className="text-sm text-muted-foreground">
          Focus clavier : Tab sur les boutons ci-dessus (fonds blanc et Brume).
        </p>
      </section>

      <section className="flex flex-col gap-4" aria-labelledby="links-title">
        <h2
          id="links-title"
          className="text-xl font-semibold text-[color:var(--color-primary-strong)]"
        >
          Link
        </h2>
        <p className="text-base text-foreground">
          Consulter les <Link href="/">communes du territoire</Link> ou la{" "}
          <Link href="https://example.com" target="_blank">
            documentation externe
          </Link>
          .
        </p>
      </section>

      <section
        className="flex flex-col gap-4"
        aria-labelledby="icon-buttons-title"
      >
        <h2
          id="icon-buttons-title"
          className="text-xl font-semibold text-[color:var(--color-primary-strong)]"
        >
          IconButton
        </h2>
        <div className="flex flex-wrap gap-3 rounded-xl bg-white p-4 ring-1 ring-border">
          <IconButton label="Ouvrir les paramètres">
            <Settings aria-hidden />
          </IconButton>
          <IconButton label="Supprimer l'élément" variant="danger">
            <Trash2 aria-hidden />
          </IconButton>
        </div>
      </section>

      <section className="flex flex-col gap-4" aria-labelledby="cards-title">
        <h2
          id="cards-title"
          className="text-xl font-semibold text-[color:var(--color-primary-strong)]"
        >
          Card
        </h2>
        <div className="grid gap-4 md:grid-cols-3">
          <Card variant="standard" className="bg-white">
            <CardHeader>
              <CardTitle as="h3">Standard</CardTitle>
            </CardHeader>
            <CardContent>
              Carte informative sur fond blanc, sans action couvrante.
            </CardContent>
            <CardFooter>
              <span className="text-sm text-muted-foreground">Lecture seule</span>
            </CardFooter>
          </Card>

          <Card
            variant="interactive"
            className="bg-[color:var(--color-surface-alt)]"
          >
            <CardHeader>
              <CardTitle as="h3">Interactive</CardTitle>
            </CardHeader>
            <CardContent>
              Un seul lien principal couvre toute la carte. Tab pour voir le
              focus.
            </CardContent>
            <InteractiveCardAction href="/">
              Ouvrir la fiche interactive
            </InteractiveCardAction>
          </Card>

          <Card variant="interactive" selected className="bg-white">
            <CardHeader>
              <CardTitle as="h3">Interactive + sélectionnée</CardTitle>
            </CardHeader>
            <CardContent>
              Bordure Vert Aubrelle, badge visible, aria-current sur le lien
              focusable.
            </CardContent>
            <InteractiveCardAction href="/">
              Ouvrir la commune sélectionnée
            </InteractiveCardAction>
          </Card>
        </div>
      </section>

      <NavigationDemo />
    </main>
  );
}
