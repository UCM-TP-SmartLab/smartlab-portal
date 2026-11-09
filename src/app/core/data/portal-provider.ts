import { InjectionToken } from "@angular/core";
import { Observable } from "rxjs";
import {
  FrontendAccessDraft,
  FrontendAccessRequest,
  FrontendAvailabilityInterval,
  FrontendContentEntry,
  FrontendDecision,
  FrontendReservation,
  FrontendReservationDraft,
  FrontendResource,
  UiContentKind,
  UiRole,
} from "../../data/frontend.models";
export abstract class PortalProvider {
  abstract content(
    kind: UiContentKind,
  ): Observable<readonly FrontendContentEntry[]>;
  abstract resources(): Observable<readonly FrontendResource[]>;
  abstract availability(
    resourceId: string,
    date: string,
  ): Observable<readonly FrontendAvailabilityInterval[]>;
  abstract reservations(
    ownerId?: string,
  ): Observable<readonly FrontendReservation[]>;
  abstract accessRequests(
    ownerId?: string,
  ): Observable<readonly FrontendAccessRequest[]>;
  abstract createReservation(
    draft: FrontendReservationDraft,
    ownerId: string,
  ): Observable<FrontendReservation>;
  abstract cancelReservation(
    id: string,
    ownerId: string,
  ): Observable<FrontendReservation>;
  abstract createAccess(
    draft: FrontendAccessDraft,
    ownerId: string,
  ): Observable<FrontendAccessRequest>;
  abstract decide(
    decision: FrontendDecision,
    role: UiRole,
  ): Observable<FrontendReservation | FrontendAccessRequest>;
}
export const PORTAL_PROVIDER = new InjectionToken<PortalProvider>(
  "PORTAL_PROVIDER",
);
export class FrontendOperationError extends Error {
  constructor(
    public readonly code:
      | "unavailable"
      | "conflict"
      | "forbidden"
      | "invalid-response"
      | "invalid",
  ) {
    super(code);
  }
}
