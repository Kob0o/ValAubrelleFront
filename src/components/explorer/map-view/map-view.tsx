"use client";

import { useEffect, useId, useRef, useState } from "react";
import { Layers, LocateFixed, Minus, MousePointer2, Plus } from "lucide-react";
import * as L from "leaflet";
import "leaflet/dist/leaflet.css";
import { IconButton } from "@/components/shared/icon-button";
import { EmptyState } from "@/components/shared/empty-state";

import { Legend } from "../legend";
import { ApiErrorState } from "./api-error-state";
import { drawableMunicipalities, formatValue, municipalityValue, valuePresentation } from "./map-model";
import { SELECTION_COLOR } from "./palette";
import type { MapViewProps, Municipality } from "./types";
import styles from "./map-view.module.css";

function fitTerritory(map: L.Map, paths: Iterable<L.Path>) {
  const bounds = L.featureGroup([...paths]).getBounds();
  if (!bounds.isValid()) return false;
  map.fitBounds(bounds, { padding: [24, 24], animate: false });
  return true;
}

export default function MapView(props: MapViewProps) {
  if (props.error) return <ApiErrorState error={props.error} onRetry={props.onRetry} />;
  if (props.isLoading) return <div className={styles.state} role="status" aria-busy="true">Chargement des communes…</div>;
  if (!drawableMunicipalities(props.municipalities).length) {
    return <EmptyState className={styles.state} title="Aucune commune à afficher sur la carte" description="Les communes disposant de données restent consultables dans la liste. Leurs géométries peuvent être indisponibles." />;
  }
  return <LeafletMap {...props} />;
}

function LeafletMap({ municipalities, values, classes, layer, selection, onSelect, zoom, center, onViewChange, fitToTerritoryOnMount = false, tileUrl, tileAttribution, onRetry }: MapViewProps) {
  const host = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const polygons = useRef(new Map<string, L.Path>());
  const fitInitialView = useRef(fitToTerritoryOnMount);
  const [tileFailed, setTileFailed] = useState(false);
  const [retry, setRetry] = useState(0);
  const patternId = `no-data-${useId().replace(/:/g, "")}`;
  const helpId = useId();

  useEffect(() => {
    if (!host.current) return;
    const map = L.map(host.current, {
      center: [50.69, 3.12], zoom: 11, minZoom: 8, maxZoom: 16, zoomSnap: 0.5,
      zoomControl: false, attributionControl: false, scrollWheelZoom: false,
      renderer: L.svg({ padding: 1 }),
    });
    mapRef.current = map;
    const attribution = L.control.attribution({ prefix: false }).addTo(map);
    attribution.addAttribution("Val d’Aubrelle");
    let initialViewFitted = false;
    const observer = new ResizeObserver(() => {
      map.invalidateSize({ pan: false });
      // Attendre les dimensions réelles du conteneur et la création des polygones.
      if (fitInitialView.current && !initialViewFitted) {
        initialViewFitted = fitTerritory(map, polygons.current.values());
      }
    });
    observer.observe(host.current);
    return () => {
      observer.disconnect();
      map.remove();
      mapRef.current = null;
    };
  }, []);

  useEffect(() => {
    mapRef.current?.setView([center.lat, center.lng], zoom, { animate: false });
  }, [center.lat, center.lng, zoom]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map || !onViewChange) return;
    const update = () => {
      const current = map.getCenter();
      onViewChange({ zoom: map.getZoom(), center: { lat: current.lat, lng: current.lng } });
    };
    map.on("moveend", update);
    return () => { map.off("moveend", update); };
  }, [onViewChange]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map || !tileUrl) return;
    const tiles = L.tileLayer(tileUrl, { attribution: tileAttribution ?? "" });
    // Leaflet ne fournit pas le statut HTTP dans tileerror : toute panne est explicite.
    tiles.on("tileerror", () => setTileFailed(true));
    tiles.addTo(map);
    return () => { tiles.off(); tiles.remove(); };
  }, [tileUrl, tileAttribution, retry]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    const currentPolygons = polygons.current;
    const group = L.featureGroup().addTo(map);
    const cleanups: (() => void)[] = [];
    for (const municipality of drawableMunicipalities(municipalities)) {
      const geo = L.geoJSON(municipality.geometry!, {
        style: { lineJoin: "miter", lineCap: "butt" },
      }).addTo(group);
      geo.eachLayer((item) => {
        const polygon = item as L.Path;
        currentPolygons.set(municipality.code, polygon);
        const path = polygon.getElement();
        if (!path) return;
        path.setAttribute("tabindex", "0");
        path.setAttribute("role", "button");
        path.setAttribute("data-code", municipality.code);
        const activate = (event: KeyboardEvent) => {
          if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            event.stopPropagation();
            onSelect(municipality.code);
          }
        };
        const focus = () => {
          path.classList.add(styles.focused);
          const position = (polygon as L.Polygon).getBounds().getCenter();
          map.panInside(position, { animate: false, padding: [35, 35] });
          polygon.openTooltip(position);
        };
        const blur = () => { path.classList.remove(styles.focused); polygon.closeTooltip(); };
        path.addEventListener("keydown", activate as EventListener);
        path.addEventListener("focus", focus);
        path.addEventListener("blur", blur);
        polygon.on("click", () => onSelect(municipality.code));
        polygon.on("mouseover", () => path.classList.add(styles.hovered));
        polygon.on("mouseout", () => path.classList.remove(styles.hovered));
        cleanups.push(() => {
          path.removeEventListener("keydown", activate as EventListener);
          path.removeEventListener("focus", focus);
          path.removeEventListener("blur", blur);
          polygon.off();
        });
      });
    }

    // Le motif appartient au SVG de cette carte : plusieurs cartes peuvent coexister.
    const svg = host.current?.querySelector(".leaflet-overlay-pane svg");
    const defs = document.createElementNS("http://www.w3.org/2000/svg", "defs");
    defs.innerHTML = `<pattern id="${patternId}" width="8" height="8" patternUnits="userSpaceOnUse"><rect width="8" height="8" fill="var(--color-surface-alt)"/><path d="M-2 2L2-2M0 8L8 0M6 10L10 6" stroke="var(--color-text-muted)" stroke-width="1.5"/></pattern>`;
    svg?.prepend(defs);
    return () => {
      cleanups.forEach((cleanup) => cleanup());
      currentPolygons.clear();
      group.remove();
      defs.remove();
    };
  }, [municipalities, onSelect, patternId]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    const labels = L.layerGroup().addTo(map);
    const drawable = drawableMunicipalities(municipalities);
    for (const municipality of drawable) {
      const polygon = polygons.current.get(municipality.code);
      if (!polygon) continue;
      const value = municipalityValue(municipality.code, values, layer);
      const presentation = valuePresentation(value, classes);
      const selected = selection.includes(municipality.code);
      polygon.setStyle({
        color: selected ? SELECTION_COLOR : "var(--color-text-muted)",
        weight: selected ? 4 : 1.2,
        fillColor: presentation.color ?? `url(#${patternId})`,
        fillOpacity: 1,
      });
      const label = `${municipality.name} (${municipality.code}) · ${formatValue(value, classes)} · ${presentation.label}`;
      polygon.getElement()?.setAttribute("aria-label", label);
      polygon.getElement()?.setAttribute("aria-pressed", String(selected));
      const tooltip = document.createElement("div");
      const tooltipName = document.createElement("strong");
      tooltipName.textContent = municipality.name;
      const tooltipDetail = document.createElement("span");
      tooltipDetail.textContent = `${municipality.code} · ${formatValue(value, classes)}`;
      tooltip.append(tooltipName, tooltipDetail);
      if (polygon.getTooltip()) polygon.setTooltipContent(tooltip);
      else polygon.bindTooltip(tooltip, { sticky: true, offset: [8, -8], className: styles.tooltip });
      if (selected) {
        const card = document.createElement("div");
        card.className = styles.selectedCard;
        const name = document.createElement("span");
        name.textContent = municipality.name;
        card.append(name);
        const amount = document.createElement("strong");
        amount.textContent = formatValue(value, classes);
        card.append(amount);
        const marker = L.marker((polygon as L.Polygon).getBounds().getCenter(), {
          interactive: false, keyboard: false,
          icon: L.divIcon({ html: card, className: styles.selectionLabel, iconSize: [200, 80], iconAnchor: [100, 84] }),
        }).addTo(labels);
        marker.getElement()?.setAttribute("aria-hidden", "true");
      }
    }
    return () => { labels.remove(); };
  }, [municipalities, values, classes, layer, selection, onSelect, patternId]);

  const selectedNames = municipalities.filter((item: Municipality) => item.isInPerimeter && selection.includes(item.code)).map((item) => item.name);
  function resetView() {
    if (mapRef.current) fitTerritory(mapRef.current, polygons.current.values());
  }

  return (
    <div className={styles.wrapper}>
      <p id={helpId} className="sr-only">Tab pour parcourir les communes. Entrée ou Espace pour sélectionner. La liste des communes offre les mêmes informations.</p>
      <div className={styles.canvas} ref={host} role="region" aria-label={`Carte des communes — ${layer === "price" ? "prix moyen" : "DPE F et G"}`} aria-describedby={helpId} inert={tileFailed} />
      {tileFailed && <div className={styles.errorOverlay}><ApiErrorState error={{ status: 503, message: "Le fond de carte ne peut pas être chargé." }} onRetry={() => { setTileFailed(false); setRetry((value) => value + 1); onRetry?.(); }} /></div>}
      {!tileFailed && <>
        <div className={styles.mapBadge}><span className={styles.badgeIcon}><Layers size={16} aria-hidden="true" /></span><span><strong>{drawableMunicipalities(municipalities).length} communes</strong><small>Val d’Aubrelle</small></span></div>
        <div className={styles.controls} aria-label="Contrôles de la carte">
          <IconButton label="Zoom avant" title="Zoom avant" onClick={() => mapRef.current?.zoomIn()}><Plus size={16} aria-hidden="true" /></IconButton>
          <IconButton label="Zoom arrière" title="Zoom arrière" onClick={() => mapRef.current?.zoomOut()}><Minus size={16} aria-hidden="true" /></IconButton>
          <IconButton label="Recentrer sur le territoire" title="Recentrer sur le territoire" onClick={resetView}><LocateFixed size={16} aria-hidden="true" /></IconButton>
        </div>
        <div className={styles.compass} aria-hidden="true"><span>N</span><svg width="24" height="32" viewBox="0 0 24 32" fill="none"><path d="M12 2L21 28L12 22L3 28L12 2Z" fill="var(--color-surface)" stroke="var(--color-primary-strong)" strokeWidth="1.5" /><path d="M12 2V22L3 28L12 2Z" fill="var(--color-primary-strong)" /></svg></div>
        <div className={styles.mapHint} aria-hidden="true"><MousePointer2 size={16} />Glissez pour explorer</div>
        <div className={styles.legendPosition}><Legend classes={classes} title={`${layer === "price" ? "Prix moyen (€/m²)" : "Part des DPE F et G (%)"}`} /></div>
      </>}
      <p className="sr-only" role="status" aria-live="polite">{selectedNames.length ? `Commune sélectionnée : ${selectedNames.join(", ")}` : "Aucune commune sélectionnée"}</p>
    </div>
  );
}
