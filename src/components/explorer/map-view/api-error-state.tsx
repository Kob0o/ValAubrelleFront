import { TriangleAlert } from "lucide-react";
import type { MapError } from "./types";
import styles from "./map-view.module.css";

/** Adaptateur local en attendant le composant partagé de G0.C. */
export function ApiErrorState({ error, onRetry }: { error: MapError; onRetry?: () => void }) {
  return (
    <div role="alert" className={styles.state}>
      <TriangleAlert aria-hidden="true" size={32} />
      <h2>La carte est temporairement indisponible</h2>
      <p>{error.message}</p>
      <p>Erreur {error.status}.</p>
      {error.correlationId && <p>Référence de l’erreur : {error.correlationId}</p>}
      {onRetry && <button type="button" onClick={onRetry}>Réessayer</button>}
    </div>
  );
}
