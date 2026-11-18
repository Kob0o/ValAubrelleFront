import { classColor, NO_DATA_LABEL } from "./map-view/palette";
import type { ValueClass } from "./map-view/types";
import styles from "./map-view/map-view.module.css";
import { ChartNoAxesColumnIncreasing } from "lucide-react";

export function Legend({ classes, title }: { classes: ValueClass[]; title: string }) {
  return (
    <section className={styles.legend} aria-label={`Légende : ${title}`}>
      <h3><ChartNoAxesColumnIncreasing size={16} aria-hidden="true" />{title}<span>Lecture de la carte</span></h3>
      <ul>
        {classes.filter((item) => !item.isNoData).map((item) => (
          <li key={item.id}>
            <span aria-hidden="true" className={styles.swatch} style={{ background: classColor(item) ?? undefined }} />
            {item.label}
          </li>
        ))}
        <li><span aria-hidden="true" className={`${styles.swatch} ${styles.hatched}`} />{NO_DATA_LABEL}</li>
      </ul>
    </section>
  );
}
