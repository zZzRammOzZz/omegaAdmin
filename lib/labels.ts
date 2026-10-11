import type { RequestStatus, VisitType } from "./database.types";

export const VISIT_TYPE_LABEL: Record<VisitType, string> = {
  installation: "New installation",
  follow_up: "Follow-up",
  issue_fix: "Issue fix",
  other: "Other",
};

export const REQUEST_STATUS_LABEL: Record<RequestStatus, string> = {
  pending: "Pending",
  approved: "Approved",
  rejected: "Rejected",
};

export const FIELD_LABEL: Record<string, string> = {
  company_id: "Company ID",
  name: "Name",
  contact_name: "Contact person",
  contact_phone: "Contact phone",
  address: "Address",
  lat: "Latitude",
  lng: "Longitude",
  directions_note: "How to find it",
  visit_type: "Visit type",
  visited_at: "Visit date",
  work_done: "Work done",
  pending: "Pending",
  notes: "Notes",
};

export function fmtDate(iso: string | null | undefined) {
  return iso ? new Date(iso).toLocaleDateString() : "—";
}

export function fmtDateTime(iso: string | null | undefined) {
  return iso ? new Date(iso).toLocaleString() : "—";
}

export function startOfDay(d = new Date()) {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
}
