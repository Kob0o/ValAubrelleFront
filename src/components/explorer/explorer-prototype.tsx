"use client";

import { useCallback, useMemo, useState, useSyncExternalStore } from "react";
import Link from "next/link";
import { ArrowUpRight, Layers, Search } from "lucide-react";
import { BrandLogo } from "@/components/layout/brand-logo";
import { BrandSignature } from "@/components/layout/brand-signature";
import { defaultExplorerQuery, mockExplorerDataSource, mockIndicatorIds, mockUser } from "@/mocks/explorer";
import { toExplorerMapData } from "@/api-mock/explorer/adapter";
import { initialMunicipalityCode } from "@/api-mock/explorer/query";
import { useExplorer } from "@/api-mock/explorer/use-explorer";
import type { ApiUser, ExplorerDataSource, ExplorerQuery } from "@/api-mock/explorer/types";
import { MapView } from "./map-view/map-view-loader";
import { formatValue, municipalityValue } from "./map-view/map-model";
import type { IndicatorFamily, MapCenter } from "./map-view/types";
import { MunicipalityList } from "./municipality-list";
import styles from "./explorer-prototype.module.css";

const compactQuery = "(max-width: 700px)";
function subscribeCompact(onChange: () => void) {
  const media = window.matchMedia(compactQuery);
  media.addEventListener("change", onChange);
  return () => media.removeEventListener("change", onChange);
}
const getCompactSnapshot = () => window.matchMedia(compactQuery).matches;
const getServerCompactSnapshot = () => false;

type ExplorerPrototypeProps = {
  dataSource?: ExplorerDataSource;
  user?: Pick<ApiUser, "municipalityCodes">;
  initialQuery?: ExplorerQuery;
  indicatorIds?: Record<IndicatorFamily, string>;
};

export function ExplorerPrototype({ dataSource = mockExplorerDataSource, user = mockUser, initialQuery = defaultExplorerQuery, indicatorIds = mockIndicatorIds }: ExplorerPrototypeProps) {
  const compact = useSyncExternalStore(subscribeCompact, getCompactSnapshot, getServerCompactSnapshot);
  const [layer, setLayer] = useState<IndicatorFamily>(initialQuery.layer === "dpe" ? "dpe" : "price");
  const [year, setYear] = useState(initialQuery.year);
  const [selection, setSelection] = useState<string[]>([initialMunicipalityCode(user)]);
  const [query, setQuery] = useState("");
  const [view, setView] = useState({ zoom: initialQuery.zoom, center: { lat: initialQuery.lat, lng: initialQuery.lng } });
  const onSelect = useCallback((code: string) => setSelection([code]), []);
  const onViewChange = useCallback((next: { zoom: number; center: MapCenter }) => {
    const zoom = next.zoom + (compact ? 0.5 : 0);
    setView((previous) => Math.abs(previous.zoom - zoom) < 1e-8 && Math.abs(previous.center.lat - next.center.lat) < 1e-8 && Math.abs(previous.center.lng - next.center.lng) < 1e-8 ? previous : { zoom, center: next.center });
  }, [compact]);
  const request = useMemo<ExplorerQuery>(() => ({
    ...initialQuery, layer, indicatorId: indicatorIds[layer], year, startYear: year, endYear: year,
    municipalityCode: selection[0] ?? initialMunicipalityCode(user), selection,
    zoom: view.zoom - (compact ? 0.5 : 0), lat: view.center.lat, lng: view.center.lng,
  }), [initialQuery, indicatorIds, user, layer, year, selection, view, compact]);
  const { data: response, years, resolvedQuery, error, isLoading, retry } = useExplorer(request, dataSource);
  // Ne pas présenter les valeurs de l’année précédente sous le nouveau millésime.
  const data = resolvedQuery?.year === year ? response : undefined;
  const availableYears = years ?? [{ year, hasData: true }];
  const yearOptions = (availableYears.some((item) => item.year === year) ? availableYears : [...availableYears, { year, hasData: false }]).slice().sort((a, b) => b.year - a.year);
  const mapData = useMemo(() => data ? toExplorerMapData(data, user.municipalityCodes, request.year, request.indicatorId) : undefined, [data, user, request.year, request.indicatorId]);
  const municipalities = mapData?.municipalities ?? [];
  const indicatorValues = mapData?.values ?? [];
  const indicatorClasses = mapData?.classes ?? { price: [], dpe: [] };
  const selected = municipalities.find((item) => item.code === selection[0]);
  const classes = indicatorClasses[layer];
  const inScope = municipalities.filter((item) => item.isInPerimeter);
  const total = data ? inScope.length : user.municipalityCodes.length;
  const filtered = inScope.filter((item) => `${item.name} ${item.code}`.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().includes(query.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().trim()));

  return (
    <main id="contenu" className={styles.shell}>
      <aside className={styles.sidebar} aria-label="Observatoire de l’habitat">
        <Link className={styles.brand} href="/"><BrandLogo variant="on-dark" /></Link>
        <p className={styles.observatory}>OBSERVATOIRE HABITAT</p>
        <p className={styles.navLabel}>ESPACE DE TRAVAIL</p>
        <a className={styles.activeNav} href="#explorateur" aria-current="page"><Layers size={21} aria-hidden="true" />Atlas<ArrowUpRight size={18} aria-hidden="true" /></a>
        <div className={styles.territoryNote}><span>Observer, comprendre et comparer l’habitat.</span></div>
      </aside>

      <div className={styles.workspace} id="explorateur">
        <header className={styles.header}><div><p className={styles.eyebrow}>ATLAS DU TERRITOIRE</p><h1>Explorer le territoire</h1></div></header>
        <section className={styles.toolbar} aria-label="Indicateurs de la carte">
          <div className={styles.layerPicker} role="group" aria-label="Indicateur">
            <button type="button" aria-pressed={layer === "price"} onClick={() => setLayer("price")}>Prix moyen</button>
            <button type="button" aria-pressed={layer === "dpe"} onClick={() => setLayer("dpe")}>DPE F + G</button>
          </div>
          <label className={styles.yearFilter}>
            <span className={styles.yearLabel}>Année</span>
            <select value={year} disabled={!years} onChange={(event) => setYear(Number(event.target.value))}>
              {yearOptions.map((item) => <option key={item.year} value={item.year} disabled={!item.hasData}>{item.year}{item.hasData ? "" : " — Pas de donnée"}</option>)}
            </select>
          </label>
          <span className={styles.toolbarHint}>Comparez les communes en un coup d’œil</span>
        </section>

        <div className={styles.explorerGrid}>
          <section className={styles.mapPanel} aria-label="Exploration cartographique">
            <MapView municipalities={municipalities} values={indicatorValues} classes={classes} layer={layer} selection={selection} onSelect={onSelect} zoom={request.zoom} center={view.center} onViewChange={onViewChange} isLoading={isLoading && !data} error={error} onRetry={retry} />
          </section>
          <aside className={styles.details} aria-label="Communes et fiche du lieu">
            <div className={styles.detailsHeading}><span>Fiche du lieu</span></div>
            {selected && <section className={styles.selectedDetail} aria-labelledby="commune-title">
              <p className={styles.eyebrow}>COMMUNE · {selected.code}</p><h2 id="commune-title">{selected.name}</h2>
              <p className={styles.indicatorLabel}>{layer === "price" ? "Prix moyen" : "Part des DPE F et G"} · {request.year}</p>
              <p className={styles.bigValue}>{formatValue(municipalityValue(selected.code, indicatorValues, layer), classes)}</p>
              <div className={styles.metrics}><div><strong>{formatValue(municipalityValue(selected.code, indicatorValues, "price"), indicatorClasses.price)}</strong><span>Prix moyen</span></div><div><strong>{formatValue(municipalityValue(selected.code, indicatorValues, "dpe"), indicatorClasses.dpe)}</strong><span>DPE F + G</span></div></div>
              <p className={styles.dataNote}>{layer === "price" ? "Prix de vente moyen par mètre carré." : "Part des étiquettes F et G parmi les diagnostics disponibles."}</p>
            </section>}
            <section className={styles.listPanel} aria-labelledby="communes-heading"><div className={styles.listHeading}><h2 id="communes-heading">Les communes</h2></div>
              <label className={styles.search}><Search size={18} aria-hidden="true" /><span className="sr-only">Rechercher une commune par nom ou code postal</span><input type="search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Nom ou code postal…" /></label>
              {data ? <MunicipalityList municipalities={filtered} values={indicatorValues} classes={classes} layer={layer} selection={selection} onSelect={onSelect} /> : <p role="status">{isLoading ? "Chargement des communes…" : "Les communes n’ont pas pu être chargées."}</p>}
            </section>
          </aside>
        </div>
        <footer className={styles.footer}><div><BrandSignature /><p>Géométries et indicateurs · Référence {request.year}</p></div></footer>
      </div>
    </main>
  );
}
