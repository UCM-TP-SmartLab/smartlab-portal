import { Observable, of, throwError } from "rxjs";
import {
  FrontendAccessDraft,
  FrontendAccessRequest,
  FrontendAvailabilityInterval,
  FrontendContentEntry,
  FrontendDecision,
  FrontendReservation,
  FrontendReservationDraft,
  UiContentKind,
  UiRole,
} from "../../data/frontend.models";
import { PUBLIC_CONTENT, PUBLIC_RESOURCES } from "../../data/public-content";
import { FrontendOperationError, PortalProvider } from "./portal-provider";
export class ProductionPortalProvider extends PortalProvider {
  content(kind: UiContentKind): Observable<readonly FrontendContentEntry[]> {
    return of(PUBLIC_CONTENT[kind]);
  }
  resources() {
    return of(PUBLIC_RESOURCES);
  }
  availability(
    _resourceId: string,
    _date: string,
  ): Observable<readonly FrontendAvailabilityInterval[]> {
    return this.unavailable();
  }
  reservations(_ownerId?: string): Observable<readonly FrontendReservation[]> {
    return this.unavailable();
  }
  accessRequests(
    _ownerId?: string,
  ): Observable<readonly FrontendAccessRequest[]> {
    return this.unavailable();
  }
  createReservation(
    _draft: FrontendReservationDraft,
    _ownerId: string,
  ): Observable<FrontendReservation> {
    return this.unavailable();
  }
  cancelReservation(
    _id: string,
    _ownerId: string,
  ): Observable<FrontendReservation> {
    return this.unavailable();
  }
  createAccess(
    _draft: FrontendAccessDraft,
    _ownerId: string,
  ): Observable<FrontendAccessRequest> {
    return this.unavailable();
  }
  decide(
    _decision: FrontendDecision,
    _role: UiRole,
  ): Observable<FrontendReservation | FrontendAccessRequest> {
    return this.unavailable();
  }
  private unavailable(): Observable<never> {
    return throwError(() => new FrontendOperationError("unavailable"));
  }
}
