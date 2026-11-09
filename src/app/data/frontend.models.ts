// Pracovné frontendové modely, nie potvrdený backendový kontrakt.
export enum UiRole {
  Visitor = "visitor",
  Student = "student",
  Manager = "manager",
  Admin = "admin",
}
export enum UiRequestStatus {
  Pending = "pending",
  Approved = "approved",
  Rejected = "rejected",
  Cancelled = "cancelled",
}
export type UiContentKind =
  | "news"
  | "projects"
  | "events"
  | "partners"
  | "opportunities";
export type UiArea = "student" | "management" | "admin";
export type UiErrorCode =
  | "unavailable"
  | "conflict"
  | "forbidden"
  | "invalid-response"
  | "invalid";
export interface FrontendSession {
  id: string;
  role: UiRole;
  name: string;
}
export interface FrontendResource {
  id: string;
  name: string;
  type: "room" | "equipment";
  description: string;
  capacity?: number;
  quantity?: number;
  equipment?: string[];
}
export interface FrontendContentEntry {
  id: string;
  slug: string;
  title: string;
  summary: string;
  body: string;
  category?: string;
  date?: string;
  end?: string;
  author?: string;
  url?: string;
  form?: string;
  audience?: string;
  partner?: string;
}
export interface FrontendReservationDraft {
  resourceId: string;
  date: string;
  start: string;
  end: string;
  quantity: number;
  purpose: string;
}
export interface FrontendHistoryEntry {
  status: UiRequestStatus;
  at: string;
  reason?: string;
}
export interface FrontendReservation extends FrontendReservationDraft {
  id: string;
  ownerId: string;
  status: UiRequestStatus;
  startUtc: string;
  endUtc: string;
  history: FrontendHistoryEntry[];
  reason?: string;
}
export interface FrontendAccessDraft {
  purpose: string;
}
export interface FrontendAccessRequest extends FrontendAccessDraft {
  id: string;
  ownerId: string;
  status: UiRequestStatus;
  history: FrontendHistoryEntry[];
  reason?: string;
}
export interface FrontendAvailabilityInterval {
  start: string;
  end: string;
  status: UiRequestStatus;
}
export type FrontendQueueItem =
  | { kind: "reservation"; item: FrontendReservation }
  | { kind: "access"; item: FrontendAccessRequest };
export interface FrontendDecision {
  kind: "reservation" | "access";
  id: string;
  status: UiRequestStatus.Approved | UiRequestStatus.Rejected;
  reason: string;
}
export interface FrontendCalendarDay {
  date: string | null;
  label: string;
}
export const STATUS_LABELS: Record<UiRequestStatus, string> = {
  pending: "Čaká na schválenie",
  approved: "Schválená",
  rejected: "Zamietnutá",
  cancelled: "Zrušená",
};
export const ROLE_LABELS: Record<UiRole, string> = {
  visitor: "Návštevník",
  student: "Študent",
  manager: "Správca",
  admin: "Administrátor",
};
