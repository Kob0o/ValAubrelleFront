import { TriangleAlert } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CorrelationId } from "@/components/shared/correlation-id";
import { getErrorMessage } from "@/lib/api/errors";
import type { MapError } from "./types";
import styles from "./map-view.module.css";

/** État cartographique utilisant les messages et actions communs au front. */
export function ApiErrorState({ error, onRetry }: { error: MapError; onRetry?: () => void }) {
  return (
    <div role="alert" className={styles.state}>
      <TriangleAlert aria-hidden="true" size={32} />
      <h2>Impossible d’afficher la carte</h2>
      <p>{getErrorMessage({ code: error.code ?? "", httpStatus: error.status })}</p>
      <p>Erreur {error.status}.</p>
      {error.status >= 500 && error.correlationId && <CorrelationId id={error.correlationId} />}
      {onRetry && <Button type="button" variant="default" onClick={onRetry}>Réessayer</Button>}
    </div>
  );
}
