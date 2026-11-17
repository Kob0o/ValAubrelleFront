import type { components } from "@/types/api";

type Schemas = components["schemas"];

export type QualityStatus = Schemas["QualityStatus"];
export type IndicatorFamily = Schemas["IndicatorFamily"];
export type Municipality = Schemas["Municipality"];
export type Indicator = Schemas["Indicator"];
export type IndicatorValue = Schemas["IndicatorValue"];
export type ValueClass = Schemas["ValueClass"];
export type Source = Schemas["Source"];
export type DisclosureRule = Schemas["DisclosureRule"];
export type DpeDetail = Schemas["DpeDetail"];
export type ViewState = Schemas["ViewState"];
export type User = Schemas["User"];
export type Mandate = Schemas["Mandate"];
export type RequestStatus = Schemas["RequestStatus"];
export type ReportStatus = Schemas["ReportStatus"];
export type AccountStatus = Schemas["AccountStatus"];
export type ReportDraft = Schemas["ReportDraft"];
export type Report = Schemas["Report"];

export type RequestItem = Schemas["RequestSummary"];
export type ReportItem = Schemas["PublishedReportSummary"];
export type Section = Schemas["ReportSection"];
export type Decision = Schemas["SectionDecisionInput"];

export type SectionStatus = NonNullable<Schemas["ReportSection"]["status"]>;
export type FreshnessStatus = NonNullable<
  NonNullable<Schemas["SourceFreshness"]["freshness"]>["status"]
>;

export type ReportDisplayStatus = ReportStatus | "draft";

export type Page<T> = {
  items: T[];
  page: number;
  size: number;
  total: number;
  sort: string;
};

export type ApiError = Schemas["ApiError"] & {
  httpStatus: number;
};

export const INSEE_CODE_PATTERN = /^(?:\d{5}|2[AB]\d{3})$/;

export type InseeCode = string;

export const QUALITY_STATUSES = [
  "available",
  "missing",
  "insufficient_sample",
  "suppressed",
  "source_error",
  "not_computable",
] as const satisfies readonly QualityStatus[];

export const REQUEST_STATUSES = [
  "new",
  "in_progress",
  "awaiting_details",
  "answered",
  "closed",
] as const satisfies readonly RequestStatus[];

export const REPORT_STATUSES = [
  "published",
  "withdrawn",
  "replaced",
] as const satisfies readonly ReportStatus[];

export const REPORT_DISPLAY_STATUSES = [
  "draft",
  "published",
  "withdrawn",
  "replaced",
] as const satisfies readonly ReportDisplayStatus[];

export const FRESHNESS_STATUSES = [
  "up_to_date",
  "running",
  "late",
  "failed",
] as const satisfies readonly FreshnessStatus[];

export const ACCOUNT_STATUSES = [
  "active",
  "inactive",
] as const satisfies readonly AccountStatus[];

export const SECTION_STATUSES = [
  "to_review",
  "accepted",
  "edited",
  "excluded",
] as const satisfies readonly SectionStatus[];

export const statusLabels = {
  quality: {
    available: "Disponible",
    missing: "Absente",
    insufficient_sample: "Petit effectif",
    suppressed: "Masquée",
    source_error: "Source en erreur",
    not_computable: "Non calculable",
  } satisfies Record<QualityStatus, string>,
  request: {
    new: "Nouvelle",
    in_progress: "En cours",
    awaiting_details: "En attente de précisions",
    answered: "Répondue",
    closed: "Clôturée",
  } satisfies Record<RequestStatus, string>,
  report: {
    draft: "Brouillon",
    published: "Publié",
    withdrawn: "Retiré",
    replaced: "Remplacé",
  } satisfies Record<ReportDisplayStatus, string>,
  freshness: {
    up_to_date: "À jour",
    running: "En cours d'actualisation",
    late: "En retard",
    failed: "Échec",
  } satisfies Record<FreshnessStatus, string>,
  account: {
    active: "Actif",
    inactive: "Inactif",
  } satisfies Record<AccountStatus, string>,
  section: {
    to_review: "À revoir",
    accepted: "Acceptée",
    edited: "Modifiée",
    excluded: "Exclue",
  } satisfies Record<SectionStatus, string>,
} as const;
