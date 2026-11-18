"use client";

import dynamic from "next/dynamic";
import type { MapViewProps } from "./types";
import styles from "./map-view.module.css";

const ClientMapView = dynamic(() => import("./map-view"), {
  ssr: false,
  loading: () => <div className={styles.state} role="status">Chargement de la carte…</div>,
});

export function MapView(props: MapViewProps) {
  return <ClientMapView {...props} />;
}
