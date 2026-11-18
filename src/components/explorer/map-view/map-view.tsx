"use client";

import { useEffect, useId, useLayoutEffect, useRef, useState } from "react";
import { Layers, LocateFixed, Minus, MousePointer2, Plus } from "lucide-react";
import "maplibre-gl/dist/maplibre-gl.css";
import { IconButton } from "@/components/shared/icon-button";
import { EmptyState } from "@/components/shared/empty-state";

import { Legend } from "../legend";
import { ApiErrorState } from "./api-error-state";
import { drawableMunicipalities } from "./map-model";
import { MapLibreScene } from "./maplibre-scene";
import type { MapViewProps } from "./types";
import styles from "./map-view.module.css";

export default function MapView(props: MapViewProps) {
  if (props.error) return <ApiErrorState error={props.error} onRetry={props.onRetry} />;
  if (props.isLoading) return <div className={styles.state} role="status" aria-busy="true">Chargement des communes…</div>;
  if (!drawableMunicipalities(props.municipalities).length) {
    return <EmptyState className={styles.state} title="Aucune commune à afficher sur la carte" description="Les communes disposant de données restent consultables dans la liste. Leurs géométries peuvent être indisponibles." />;
  }
  return <MapLibreMap {...props} />;
}

function MapLibreMap(props: MapViewProps) {
  const { municipalities, classes, layer, selection } = props;
  const host = useRef<HTMLDivElement>(null);
  const scene = useRef<MapLibreScene | null>(null);
  const latest = useRef(props);
  const [ready, setReady] = useState(false);
  const [failed, setFailed] = useState(false);
  const [attempt, setAttempt] = useState(0);
  const helpId = useId();

  useEffect(() => {
    latest.current = props;
    scene.current?.update(props);
  }, [props]);

  useEffect(() => {
    let active = true;
    let current: MapLibreScene | undefined;
    // Différer la création permet aussi le nettoyage du premier montage StrictMode.
    queueMicrotask(() => {
      if (!active || !host.current) return;
      try {
        current = new MapLibreScene(host.current, latest.current,
          () => { if (active) setReady(true); },
          () => { if (active) setFailed(true); });
        scene.current = current;
      } catch {
        if (active) setFailed(true);
      }
    });
    return () => { active = false; current?.destroy(); scene.current = null; };
  }, [attempt]);

  useLayoutEffect(() => {
    if (ready && !failed) scene.current?.activate();
  }, [ready, failed]);

  const selectedNames = municipalities.filter((item) => item.isInPerimeter && selection.includes(item.code)).map((item) => item.name);
  return (
    <div className={styles.wrapper}>
      <p id={helpId} className="sr-only">Tab pour parcourir les communes. Entrée ou Espace pour sélectionner. La liste des communes offre les mêmes informations.</p>
      <div className={styles.stage}>
        <div className={styles.canvas} ref={host} role="region" aria-label={`Carte des communes — ${layer === "price" ? "prix moyen" : "DPE F et G"}`} aria-describedby={helpId} inert={!ready || failed} />
        {failed && <div className={styles.errorOverlay}><ApiErrorState error={{ status: 503, message: "La carte ne peut pas être chargée." }} onRetry={() => { setFailed(false); setReady(false); setAttempt((value) => value + 1); latest.current.onRetry?.(); }} /></div>}
        {!ready && !failed && <div className={styles.errorOverlay}><div className={styles.state} role="status" aria-busy="true">Chargement de la carte…</div></div>}
        {ready && !failed && <>
          <div className={styles.mapBadge}><span className={styles.badgeIcon}><Layers size={16} aria-hidden="true" /></span><span><strong>{drawableMunicipalities(municipalities).length} communes</strong><small>Val d’Aubrelle</small></span></div>
          <div className={styles.controls} aria-label="Contrôles de la carte">
            <IconButton tabIndex={0} label="Zoom avant" title="Zoom avant" onClick={() => scene.current?.zoomBy(1)}><Plus size={16} aria-hidden="true" /></IconButton>
            <IconButton tabIndex={0} label="Zoom arrière" title="Zoom arrière" onClick={() => scene.current?.zoomBy(-1)}><Minus size={16} aria-hidden="true" /></IconButton>
            <IconButton tabIndex={0} label="Recentrer sur le territoire" title="Recentrer sur le territoire" onClick={() => scene.current?.resetView()}><LocateFixed size={16} aria-hidden="true" /></IconButton>
          </div>
          <div className={styles.compass} aria-hidden="true"><span>N</span><svg width="24" height="32" viewBox="0 0 24 32" fill="none"><path d="M12 2L21 28L12 22L3 28L12 2Z" fill="var(--color-surface)" stroke="var(--color-primary-strong)" strokeWidth="1.5" /><path d="M12 2V22L3 28L12 2Z" fill="var(--color-primary-strong)" /></svg></div>
          <div className={styles.mapHint} aria-hidden="true"><MousePointer2 size={16} />Glissez pour explorer</div>
        </>}
      </div>
      {ready && !failed && <div className={styles.legendPosition}><Legend classes={classes} title={`${layer === "price" ? "Prix moyen (€/m²)" : "Part des DPE F et G (%)"}`} /></div>}
      <p className="sr-only" role="status" aria-live="polite">{selectedNames.length ? `Commune sélectionnée : ${selectedNames.join(", ")}` : "Aucune commune sélectionnée"}</p>
    </div>
  );
}
