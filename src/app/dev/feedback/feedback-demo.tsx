"use client";

import { useState } from "react";
import { FileSearch } from "lucide-react";

import { Banner } from "@/components/shared/banner";
import { ConfirmDialog, useConfirm } from "@/components/shared/confirm-dialog";
import { Drawer } from "@/components/shared/drawer";
import { EmptyState } from "@/components/shared/empty-state";
import { Modal } from "@/components/shared/modal";
import { LoadingRegion, Skeleton } from "@/components/shared/skeleton";
import { Button } from "@/components/ui/button";
import { useFeedback } from "@/hooks/use-feedback";
import { buildApiError } from "@/lib/api/errors";

function DemoSection({
  id,
  title,
  children,
}: {
  id: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="flex flex-col gap-4" aria-labelledby={id}>
      <h2
        id={id}
        className="text-xl font-semibold text-[var(--color-primary-strong)]"
      >
        {title}
      </h2>
      {children}
    </section>
  );
}

export function FeedbackDemo() {
  const feedback = useFeedback();
  const { confirm, confirmDialog } = useConfirm();

  const [bannerVisible, setBannerVisible] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalSize, setModalSize] = useState<"sm" | "md" | "lg">("md");
  const [busyModalOpen, setBusyModalOpen] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [controlledOpen, setControlledOpen] = useState(false);
  const [controlledBusy, setControlledBusy] = useState(false);
  const [controlledError, setControlledError] = useState<string | null>(null);

  return (
    <>
      <DemoSection id="banner-title" title="Banner">
        <div className="flex flex-col gap-3">
          <Banner kind="info" title="Mise à jour des données" live="polite">
            Les indicateurs 2024 seront intégrés vendredi.
          </Banner>
          <Banner kind="success" title="Export terminé" live="polite">
            Le fichier CSV est prêt à être téléchargé.
          </Banner>
          <Banner
            kind="warning"
            title="Données partielles"
            action={
              <Button
                variant="outline"
                onClick={() =>
                  feedback.info(
                    "Communes en attente : Lille, Roubaix, Tourcoing (données fictives).",
                  )
                }
              >
                Voir le détail
              </Button>
            }
          >
            3 communes n’ont pas encore transmis leurs données 2024.
          </Banner>
          <Banner kind="error" title="Échec de l'enregistrement" live="assertive">
            Vérifiez votre connexion puis réessayez.
          </Banner>
          {bannerVisible ? (
            <Banner
              kind="info"
              title="Bannière refermable"
              onClose={() => setBannerVisible(false)}
            >
              Le bouton « Fermer » fait au moins 44 px et porte un libellé
              accessible.
            </Banner>
          ) : (
            <Button variant="outline" onClick={() => setBannerVisible(true)}>
              Réafficher la bannière refermable
            </Button>
          )}
        </div>
      </DemoSection>

      <DemoSection id="toast-title" title="Toast (useFeedback)">
        <div className="flex flex-wrap gap-3">
          <Button
            variant="outline"
            onClick={() => feedback.info("Synchronisation planifiée.")}
          >
            Info
          </Button>
          <Button
            variant="outline"
            onClick={() => feedback.success("Demande enregistrée.")}
          >
            Succès
          </Button>
          <Button
            variant="outline"
            onClick={() =>
              feedback.warning("Certaines données datent de 2022.")
            }
          >
            Avertissement
          </Button>
          <Button
            variant="outline"
            onClick={() => feedback.error(buildApiError({ httpStatus: 0 }))}
          >
            Erreur (persistante)
          </Button>
        </div>
      </DemoSection>

      <DemoSection id="modal-title" title="Modal">
        <div className="flex flex-wrap gap-3">
          {(["sm", "md", "lg"] as const).map((size) => (
            <Button
              key={size}
              variant="outline"
              onClick={() => {
                setModalSize(size);
                setModalOpen(true);
              }}
            >
              Ouvrir ({size})
            </Button>
          ))}
          <Button variant="outline" onClick={() => setBusyModalOpen(true)}>
            Ouvrir (confirmation en cours)
          </Button>
        </div>
        <Modal
          open={modalOpen}
          onClose={() => setModalOpen(false)}
          title={`Fenêtre modale (${modalSize})`}
          description="Le focus est piégé dans la fenêtre ; Échap la ferme et rend le focus au bouton d'ouverture."
          footer={
            <>
              <Button variant="outline" onClick={() => setModalOpen(false)}>
                Annuler
              </Button>
              <Button
                variant="primary"
                onClick={() => {
                  setModalOpen(false);
                  feedback.success("Action enregistrée.");
                }}
              >
                Enregistrer
              </Button>
            </>
          }
        >
          <p>
            À 390 px, la fenêtre occupe tout l’écran. Sur bureau, la largeur
            dépend de la prop <code>size</code>. Le contenu long défile à
            l’intérieur de la fenêtre.
          </p>
        </Modal>

        <Modal
          open={busyModalOpen}
          onClose={() => setBusyModalOpen(false)}
          title="Enregistrement en cours"
          description="Pendant une confirmation, la fenêtre ne peut pas être fermée."
          busy
          footer={
            <Button variant="primary" disabled aria-busy="true">
              Enregistrement…
            </Button>
          }
        >
          <p>
            Tant que la prop <code>busy</code> est active, Échap, le clic sur
            l’arrière-plan et le bouton « Fermer » sont sans effet.
          </p>
        </Modal>
      </DemoSection>

      <DemoSection id="drawer-title" title="Drawer">
        <div>
          <Button variant="outline" onClick={() => setDrawerOpen(true)}>
            Ouvrir le panneau
          </Button>
        </div>
        <Drawer
          open={drawerOpen}
          onClose={() => setDrawerOpen(false)}
          title="Panneau latéral"
          description="Ouvert à droite sur bureau, en bas sur mobile (moins de 640 px)."
          footer={
            <Button variant="primary" onClick={() => setDrawerOpen(false)}>
              Fermer le panneau
            </Button>
          }
        >
          <p>
            Le côté d’ouverture se règle avec la prop <code>side</code> ; sans
            indication, il bascule automatiquement selon la largeur d’écran.
          </p>
        </Drawer>
      </DemoSection>

      <DemoSection id="skeleton-title" title="Skeleton">
        <div className="grid gap-6 sm:grid-cols-3">
          <div className="flex flex-col gap-2">
            <p className="text-sm font-semibold">shape=&quot;line&quot; (3 lignes)</p>
            <LoadingRegion label="Chargement des indicateurs…">
              <Skeleton shape="line" lines={3} />
            </LoadingRegion>
          </div>
          <div className="flex flex-col gap-2">
            <p className="text-sm font-semibold">shape=&quot;block&quot;</p>
            <Skeleton shape="block" />
          </div>
          <div className="flex flex-col gap-2">
            <p className="text-sm font-semibold">shape=&quot;cell&quot; (44 px)</p>
            <Skeleton shape="cell" />
          </div>
        </div>
      </DemoSection>

      <DemoSection id="empty-state-title" title="EmptyState">
        <div className="grid gap-6 sm:grid-cols-2">
          <EmptyState
            title="Aucune demande en cours"
            description="Les demandes des communes apparaîtront ici."
          />
          <EmptyState
            icon={FileSearch}
            title="Aucun résultat"
            description="Essayez d'élargir votre recherche ou de réinitialiser les filtres."
            action={<Button variant="outline">Réinitialiser les filtres</Button>}
          />
        </div>
      </DemoSection>

      <DemoSection id="confirm-title" title="ConfirmDialog">
        <div className="flex flex-wrap gap-3">
          <Button
            variant="outline"
            onClick={() => {
              void confirm({
                title: "Publier le rapport",
                description:
                  "Le rapport sera visible par toutes les communes du périmètre.",
                confirmLabel: "Publier le rapport",
                onConfirm: async () => {
                  await new Promise((resolve) => setTimeout(resolve, 800));
                  feedback.success("Rapport publié.");
                },
              });
            }}
          >
            Confirmation simple
          </Button>
          <Button
            variant="danger"
            onClick={() => {
              void confirm({
                title: "Désactiver le compte",
                description:
                  "L'utilisateur ne pourra plus se connecter. Cette action est réversible par un administrateur.",
                confirmLabel: "Désactiver le compte",
                tone: "danger",
                onConfirm: async () => {
                  await new Promise((resolve) => setTimeout(resolve, 800));
                  feedback.success("Compte désactivé.");
                },
              });
            }}
          >
            Confirmation danger
          </Button>
          <Button
            variant="outline"
            onClick={() => {
              void confirm({
                title: "Supprimer le brouillon",
                description:
                  "Cette action est définitive. Le brouillon ne pourra pas être récupéré.",
                confirmLabel: "Supprimer le brouillon",
                tone: "danger",
                onConfirm: async () => {
                  await new Promise((resolve) => setTimeout(resolve, 800));
                  throw new Error("Échec simulé");
                },
              });
            }}
          >
            Échec simulé (le dialogue reste ouvert)
          </Button>
          <Button variant="outline" onClick={() => setControlledOpen(true)}>
            Usage contrôlé (sans useConfirm)
          </Button>
        </div>

        {confirmDialog}

        <ConfirmDialog
          open={controlledOpen}
          title="Envoyer le dossier"
          description="Le dossier sera transmis à l'instructeur. Vous ne pourrez plus le modifier."
          confirmLabel="Envoyer le dossier"
          busy={controlledBusy}
          error={controlledError}
          onCancel={() => {
            setControlledOpen(false);
            setControlledError(null);
          }}
          onConfirm={async () => {
            setControlledBusy(true);
            setControlledError(null);
            await new Promise((resolve) => setTimeout(resolve, 800));
            setControlledBusy(false);
            setControlledOpen(false);
            feedback.success("Dossier envoyé.");
          }}
        />
      </DemoSection>
    </>
  );
}
