import {
  Archive,
  Ban,
  Check,
  CircleAlert,
  CircleCheck,
  CircleDot,
  CircleHelp,
  Clock,
  Eye,
  FileCheck,
  FilePen,
  Files,
  FileX,
  LoaderCircle,
  MessageCircleQuestion,
  MessageSquareReply,
  Pencil,
  RefreshCw,
  UserCheck,
  UserX,
  type LucideIcon,
} from "lucide-react";

import {
  statusLabels,
  type AccountStatus,
  type FreshnessStatus,
  type ReportDisplayStatus,
  type RequestStatus,
  type SectionStatus,
} from "@/types/domain";

export type StatusKind = "request" | "report" | "source" | "account" | "section";

export type StatusByKind = {
  request: RequestStatus;
  report: ReportDisplayStatus;
  source: FreshnessStatus;
  account: AccountStatus;
  section: SectionStatus;
};

/**
 * Tons limités aux couleurs d'état du thème (provisoires, cf. tokens.ts).
 * Le libellé reste toujours affiché : la couleur ne porte jamais seule le sens.
 */
export type StatusTone = "neutral" | "info" | "success" | "warning" | "danger";

export type StatusVisual = { icon: LucideIcon; tone: StatusTone };

export const statusVisuals: {
  [K in StatusKind]: Record<StatusByKind[K], StatusVisual>;
} = {
  request: {
    new: { icon: CircleDot, tone: "info" },
    in_progress: { icon: LoaderCircle, tone: "info" },
    awaiting_details: { icon: MessageCircleQuestion, tone: "warning" },
    answered: { icon: MessageSquareReply, tone: "success" },
    closed: { icon: Archive, tone: "neutral" },
  },
  report: {
    draft: { icon: FilePen, tone: "neutral" },
    published: { icon: FileCheck, tone: "success" },
    withdrawn: { icon: FileX, tone: "warning" },
    replaced: { icon: Files, tone: "neutral" },
  },
  source: {
    up_to_date: { icon: CircleCheck, tone: "success" },
    running: { icon: RefreshCw, tone: "info" },
    late: { icon: Clock, tone: "warning" },
    failed: { icon: CircleAlert, tone: "danger" },
  },
  account: {
    active: { icon: UserCheck, tone: "success" },
    inactive: { icon: UserX, tone: "neutral" },
  },
  section: {
    to_review: { icon: Eye, tone: "info" },
    accepted: { icon: Check, tone: "success" },
    edited: { icon: Pencil, tone: "info" },
    excluded: { icon: Ban, tone: "neutral" },
  },
};

export const statusLabelsByKind: {
  [K in StatusKind]: Record<StatusByKind[K], string>;
} = {
  request: statusLabels.request,
  report: statusLabels.report,
  source: statusLabels.freshness,
  account: statusLabels.account,
  section: statusLabels.section,
};

export const UNKNOWN_STATUS_LABEL = "Statut inconnu";
export const unknownStatusVisual: StatusVisual = {
  icon: CircleHelp,
  tone: "neutral",
};

export function resolveStatus(kind: StatusKind, status: string) {
  const labels: Record<string, string> = statusLabelsByKind[kind];
  const visuals: Record<string, StatusVisual> = statusVisuals[kind];
  if (Object.hasOwn(labels, status) && Object.hasOwn(visuals, status)) {
    return { known: true, label: labels[status], ...visuals[status] };
  }
  return { known: false, label: UNKNOWN_STATUS_LABEL, ...unknownStatusVisual };
}
