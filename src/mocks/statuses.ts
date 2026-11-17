import {
  ACCOUNT_STATUSES,
  FRESHNESS_STATUSES,
  REPORT_DISPLAY_STATUSES,
  REQUEST_STATUSES,
  SECTION_STATUSES,
  statusLabels,
  type AccountStatus,
  type FreshnessStatus,
  type ReportDisplayStatus,
  type RequestStatus,
  type SectionStatus,
} from "@/types/domain";

export type StatusSample<T extends string> = {
  value: T;
  label: string;
};

export const mockRequestStatuses: StatusSample<RequestStatus>[] =
  REQUEST_STATUSES.map((value) => ({
    value,
    label: statusLabels.request[value],
  }));

export const mockReportStatuses: StatusSample<ReportDisplayStatus>[] =
  REPORT_DISPLAY_STATUSES.map((value) => ({
    value,
    label: statusLabels.report[value],
  }));

export const mockFreshnessStatuses: StatusSample<FreshnessStatus>[] =
  FRESHNESS_STATUSES.map((value) => ({
    value,
    label: statusLabels.freshness[value],
  }));

export const mockAccountStatuses: StatusSample<AccountStatus>[] =
  ACCOUNT_STATUSES.map((value) => ({
    value,
    label: statusLabels.account[value],
  }));

export const mockSectionStatuses: StatusSample<SectionStatus>[] =
  SECTION_STATUSES.map((value) => ({
    value,
    label: statusLabels.section[value],
  }));
