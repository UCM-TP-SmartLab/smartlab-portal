import { defer, Observable, of } from "rxjs";
import {
  FrontendAccessDraft,
  FrontendAccessRequest,
  FrontendAvailabilityInterval,
  FrontendDecision,
  FrontendReservation,
  FrontendReservationDraft,
  UiContentKind,
  UiRequestStatus,
  UiRole,
} from "../../data/frontend.models";
import {
  resolveBratislavaTime,
  validateInterval,
} from "../../shared/utils/bratislava-time";
import { DEMO_CONTENT, DEMO_RESOURCES } from "./demo-fixtures";
import { FrontendOperationError, PortalProvider } from "./portal-provider";
export class DemoPortalProvider extends PortalProvider {
  private bookings: FrontendReservation[] = [];
  private requests: FrontendAccessRequest[] = [];
  private sequence = 0;
  content(kind: UiContentKind) {
    return of(DEMO_CONTENT[kind]);
  }
  resources() {
    return of(DEMO_RESOURCES);
  }
  reservations(ownerId?: string) {
    return of(this.bookings.filter((r) => !ownerId || r.ownerId === ownerId));
  }
  accessRequests(ownerId?: string) {
    return of(this.requests.filter((r) => !ownerId || r.ownerId === ownerId));
  }
  availability(
    resourceId: string,
    date: string,
  ): Observable<readonly FrontendAvailabilityInterval[]> {
    return of(
      this.bookings
        .filter(
          (r) =>
            r.resourceId === resourceId && r.date === date && this.blocks(r),
        )
        .map((r) => ({ start: r.startUtc, end: r.endUtc, status: r.status })),
    );
  }
  createReservation(
    draft: FrontendReservationDraft,
    ownerId: string,
  ): Observable<FrontendReservation> {
    return defer(() => {
      const resource = DEMO_RESOURCES.find((r) => r.id === draft.resourceId);
      if (
        !resource ||
        !draft.purpose.trim() ||
        validateInterval(draft.date, draft.start, draft.end, draft.quantity) ||
        (resource.quantity && draft.quantity > resource.quantity) ||
        (resource.type === "room" && draft.quantity !== 1)
      )
        throw new FrontendOperationError("invalid");
      const from = resolveBratislavaTime(draft.date, draft.start);
      const to = resolveBratislavaTime(draft.date, draft.end);
      if (from.kind !== "valid" || to.kind !== "valid")
        throw new FrontendOperationError("invalid");
      if (
        this.bookings.some(
          (r) =>
            r.resourceId === draft.resourceId &&
            this.blocks(r) &&
            r.startUtc < to.utc &&
            r.endUtc > from.utc,
        )
      )
        throw new FrontendOperationError("conflict");
      const value: FrontendReservation = {
        ...draft,
        id: `demo-r-${++this.sequence}`,
        ownerId,
        status: UiRequestStatus.Pending,
        startUtc: from.utc,
        endUtc: to.utc,
        history: [
          { status: UiRequestStatus.Pending, at: new Date().toISOString() },
        ],
      };
      this.bookings = [...this.bookings, value];
      return of(value);
    });
  }
  cancelReservation(
    id: string,
    ownerId: string,
  ): Observable<FrontendReservation> {
    return defer(() => {
      const item = this.bookings.find((r) => r.id === id);
      if (!item || item.ownerId !== ownerId || !this.blocks(item))
        throw new FrontendOperationError("forbidden");
      const updated = {
        ...item,
        status: UiRequestStatus.Cancelled,
        history: [
          ...item.history,
          { status: UiRequestStatus.Cancelled, at: new Date().toISOString() },
        ],
      };
      this.bookings = this.bookings.map((r) => (r.id === id ? updated : r));
      return of(updated);
    });
  }
  createAccess(
    draft: FrontendAccessDraft,
    ownerId: string,
  ): Observable<FrontendAccessRequest> {
    return defer(() => {
      if (!draft.purpose.trim()) throw new FrontendOperationError("invalid");
      const item = {
        ...draft,
        ownerId,
        id: `demo-a-${++this.sequence}`,
        status: UiRequestStatus.Pending,
        history: [
          { status: UiRequestStatus.Pending, at: new Date().toISOString() },
        ],
      };
      this.requests = [...this.requests, item];
      return of(item);
    });
  }
  decide(
    decision: FrontendDecision,
    role: UiRole,
  ): Observable<FrontendReservation | FrontendAccessRequest> {
    return defer(() => {
      if (role !== UiRole.Manager && role !== UiRole.Admin)
        throw new FrontendOperationError("forbidden");
      if (
        decision.status === UiRequestStatus.Rejected &&
        !decision.reason.trim()
      )
        throw new FrontendOperationError("invalid");
      const collection =
        decision.kind === "reservation" ? this.bookings : this.requests;
      const item = collection.find((r) => r.id === decision.id);
      if (!item || item.status !== UiRequestStatus.Pending)
        throw new FrontendOperationError("invalid");
      const updated = {
        ...item,
        status: decision.status,
        reason: decision.reason.trim(),
        history: [
          ...item.history,
          {
            status: decision.status,
            at: new Date().toISOString(),
            reason: decision.reason.trim(),
          },
        ],
      };
      if (decision.kind === "reservation")
        this.bookings = this.bookings.map((r) =>
          r.id === item.id ? (updated as FrontendReservation) : r,
        );
      else
        this.requests = this.requests.map((r) =>
          r.id === item.id ? updated : r,
        );
      return of(updated);
    });
  }
  private blocks(item: FrontendReservation): boolean {
    return (
      item.status === UiRequestStatus.Pending ||
      item.status === UiRequestStatus.Approved
    );
  }
}
