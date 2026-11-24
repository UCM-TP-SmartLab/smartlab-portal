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
    // TODO: Zapojenie /api/public/* po dodaní dátového kontraktu; zatiaľ schválený lokálny obsah.
    return of(PUBLIC_CONTENT[kind]);
  }
  resources() {
    return of(PUBLIC_RESOURCES);
  }
  availability(
    _resourceId: string,
    _date: string,
  ): Observable<readonly FrontendAvailabilityInterval[]> {
    // TODO: GET /api/spaces/{id}/availability alebo /api/equipment/{id}/availability.
    return this.unavailable();
  }
  reservations(_ownerId?: string): Observable<readonly FrontendReservation[]> {
    // TODO: GET /api/me/reservations alebo /api/management/reservations podľa oprávnení.
    return this.unavailable();
  }
  accessRequests(
    _ownerId?: string,
  ): Observable<readonly FrontendAccessRequest[]> {
    // TODO: GET /api/me/access-requests alebo /api/management/access-requests.
    return this.unavailable();
  }
  createReservation(
    _draft: FrontendReservationDraft,
    _ownerId: string,
  ): Observable<FrontendReservation> {
    // TODO: POST /api/reservations; vlastníka musí odvodiť backend zo session.
    return this.unavailable();
  }
  cancelReservation(
    _id: string,
    _ownerId: string,
  ): Observable<FrontendReservation> {
    // TODO: POST /api/reservations/{id}/cancel; úspech až po odpovedi servera.
    return this.unavailable();
  }
  createAccess(
    _draft: FrontendAccessDraft,
    _ownerId: string,
  ): Observable<FrontendAccessRequest> {
    // TODO: POST /api/access-requests po potvrdení polí a významu prístupu.
    return this.unavailable();
  }
  decide(
    _decision: FrontendDecision,
    _role: UiRole,
  ): Observable<FrontendReservation | FrontendAccessRequest> {
    // TODO: POST /api/management/reservations/{id}/decision alebo access-requests/{id}/decision.
    return this.unavailable();
  }
  private unavailable(): Observable<never> {
    return throwError(() => new FrontendOperationError("unavailable"));
  }
}
