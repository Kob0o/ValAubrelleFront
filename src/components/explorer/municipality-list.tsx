import { Check, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/shared/empty-state";
import { formatValue, inPerimeter, municipalityValue, valuePresentation } from "./map-view/map-model";
import type { IndicatorFamily, IndicatorValue, Municipality, ValueClass } from "./map-view/types";
import styles from "./explorer-prototype.module.css";
import mapStyles from "./map-view/map-view.module.css";

type Props = {
  municipalities: Municipality[];
  values: IndicatorValue[];
  classes: ValueClass[];
  layer: IndicatorFamily;
  selection: string[];
  onSelect: (code: string) => void;
  onClearSearch?: () => void;
};

/** Alternative HTML utilisable même pour une commune sans géométrie. */
export function MunicipalityList({ municipalities, values, classes, layer, selection, onSelect, onClearSearch }: Props) {
  const items = inPerimeter(municipalities);
  return (
    <ul className={styles.municipalityList} aria-label="Liste des communes">
      {items.map((municipality) => {
        const value = municipalityValue(municipality.code, values, layer);
        const presentation = valuePresentation(value, classes);
        const selected = selection.includes(municipality.code);
        return (
          <li key={municipality.code}>
            <Button type="button" variant="ghost" aria-pressed={selected} onClick={() => onSelect(municipality.code)}>
              <span aria-hidden="true" className={`${mapStyles.swatch} ${presentation.isNoData ? mapStyles.hatched : ""}`} style={{ backgroundColor: presentation.color ?? undefined }} />
              <span className={styles.communeName}>{municipality.name}<small>{municipality.code}{!municipality.geometry && " · Géométrie indisponible"}</small></span>
              <span className={styles.communeValue}>{formatValue(value, classes)}</span>
              {selected ? <Check size={16} aria-label="Sélectionnée" /> : <MapPin size={16} aria-hidden="true" />}
            </Button>
          </li>
        );
      })}
      {!items.length && <li className={styles.noResults}>
        <EmptyState title={onClearSearch ? "Aucune commune ne correspond à votre recherche." : "Aucune commune disponible."} />
        {onClearSearch && <Button type="button" variant="outline" onClick={onClearSearch}>Effacer la recherche</Button>}
      </li>}
    </ul>
  );
}
