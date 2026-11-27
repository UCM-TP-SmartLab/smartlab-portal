import { inject, Injectable, PLATFORM_ID } from "@angular/core";
import { isPlatformBrowser } from "@angular/common";
import { HttpClient, HttpErrorResponse } from "@angular/common/http";
import { Store } from "@ngrx/store";
import {
  catchError,
  expand,
  map,
  of,
  reduce,
  switchMap,
  take,
  throwError,
  EMPTY,
} from "rxjs";
import { API_BASE_URL } from "../../config/api.config";
import {
  FrontendAccessDraft,
  FrontendAccessRequest,
  FrontendContentEntry,
  FrontendDecision,
  FrontendReservation,
  FrontendReservationDraft,
  UiContentKind,
  UiRequestStatus,
} from "../../data/frontend.models";
import { selectSession } from "../../store/session/session.store";
import { resolveBratislavaTime } from "../../shared/utils/bratislava-time";
import { FrontendOperationError } from "./portal-provider";
import { SpacesApi } from "./spaces-api";
import { ProductionPortalProvider } from "./production-portal.provider";
@Injectable()
export class ApiPortalProvider extends ProductionPortalProvider {
  private readonly spaces = inject(SpacesApi);
  private readonly browser = isPlatformBrowser(inject(PLATFORM_ID));
  private readonly http = inject(HttpClient);
  private readonly base = inject(API_BASE_URL);
  private readonly store = inject(Store);
  override content(kind: UiContentKind) {
    if (!this.browser) return super.content(kind);
    const path = kind === "opportunities" ? "student-opportunities" : kind;
    const page = (index: number) =>
      this.http
        .get<{ data: unknown; nextPage: unknown }>(
          `${this.base}/public/${path}`,
          {
            params: { page: index },
          },
        )
        .pipe(
          map(({ data, nextPage }) => {
            if (
              !Array.isArray(data) ||
              !data.every(isContentEntry) ||
              (nextPage !== null && nextPage !== index + 1)
            ) {
              throw new FrontendOperationError("invalid-response");
            }
            return { data, nextPage };
          }),
        );
    return page(1).pipe(
      expand(({ nextPage }) => (nextPage === null ? EMPTY : page(nextPage))),
      reduce(
        (entries, response) => entries.concat(response.data),
        [] as FrontendContentEntry[],
      ),
      catchError((error: unknown) =>
        error instanceof HttpErrorResponse &&
        [0, 404, 502, 503, 504].includes(error.status)
          ? super.content(kind)
          : throwError(() => error),
      ),
    );
  }
  override resources() {
    return this.browser ? this.spaces.list() : super.resources();
  }
  override resource(id: string) {
    return this.browser ? this.spaces.detail(id) : super.resource(id);
  }
  override availability(id: string, date: string) {
    if (!id || !date) return of([]);
    return this.browser
      ? this.spaces.availability(id, date)
      : super.availability(id, date);
  }
  override reservations(ownerId?: string) {
    return this.readRequests(ownerId, "reservations", isReservation);
  }
  override accessRequests(ownerId?: string) {
    return this.readRequests(ownerId, "access-requests", isRequest);
  }
  override createReservation(draft: FrontendReservationDraft) {
    const start = resolveBratislavaTime(draft.date, draft.start);
    const end = resolveBratislavaTime(draft.date, draft.end);
    if (start.kind !== "valid" || end.kind !== "valid")
      return throwError(() => new FrontendOperationError("invalid"));
    return this.write(
      "reservations",
      {
        resourceId: draft.resourceId,
        quantity: draft.quantity,
        purpose: draft.purpose,
        startUtc: start.utc,
        endUtc: end.utc,
      },
      isReservation,
    );
  }
  override cancelReservation(id: string) {
    return this.write(
      `reservations/${encodeURIComponent(id)}/cancel`,
      {},
      isReservation,
    );
  }
  override createAccess(draft: FrontendAccessDraft) {
    return this.write("access-requests", draft, isRequest);
  }
  override decide(decision: FrontendDecision) {
    const reservation = decision.kind === "reservation";
    const type = reservation ? "reservations" : "access-requests";
    return this.write(
      `management/${type}/${encodeURIComponent(decision.id)}/decision`,
      { status: decision.status, reason: decision.reason },
      reservation ? isReservation : isRequest,
    );
  }
  private readRequests<T>(
    ownerId: string | undefined,
    path: string,
    valid: (value: unknown) => value is T,
  ) {
    const scope = ownerId ? "me" : "management";
    return this.http
      .get<{ data: unknown }>(`${this.base}/${scope}/${path}`)
      .pipe(
        map((response) => {
          const data = response?.data;
          if (!Array.isArray(data) || !data.every(valid))
            throw new FrontendOperationError("invalid-response");
          return data;
        }),
      );
  }
  private write<T>(
    path: string,
    body: object,
    valid: (value: unknown) => value is T,
  ) {
    return this.store.select(selectSession).pipe(
      take(1),
      switchMap(({ csrfToken }) =>
        this.http.post<{ data: unknown }>(`${this.base}/${path}`, body, {
          headers: { "X-CSRF-Token": csrfToken ?? "" },
        }),
      ),
      map((response) => {
        if (!valid(response?.data))
          throw new FrontendOperationError("invalid-response");
        return response.data;
      }),
    );
  }
}

function isStatus(value: unknown): boolean {
  return Object.values(UiRequestStatus).includes(value as UiRequestStatus);
}
function isRequest(value: unknown): value is FrontendAccessRequest {
  if (!value || typeof value !== "object") return false;
  const item = value as Record<string, unknown>;
  return (
    typeof item.id === "string" &&
    Boolean(item.id) &&
    typeof item.ownerId === "string" &&
    typeof item.purpose === "string" &&
    isStatus(item.status) &&
    Array.isArray(item.history) &&
    item.history.every((event: unknown) => {
      if (!event || typeof event !== "object") return false;
      const entry = event as Record<string, unknown>;
      return isStatus(entry.status) && typeof entry.at === "string";
    })
  );
}
function isReservation(value: unknown): value is FrontendReservation {
  if (!isRequest(value)) return false;
  const item = value as unknown as Record<string, unknown>;
  return (
    ["resourceId", "date", "start", "end", "startUtc", "endUtc"].every(
      (key) => typeof item[key] === "string",
    ) &&
    typeof item.quantity === "number" &&
    Number.isSafeInteger(item.quantity) &&
    item.quantity > 0
  );
}

function isContentEntry(value: unknown): value is FrontendContentEntry {
  if (!value || typeof value !== "object") return false;
  const entry = value as Record<string, unknown>;
  return (
    ["id", "slug", "title", "summary", "body"].every(
      (key) => typeof entry[key] === "string",
    ) &&
    [
      "category",
      "date",
      "end",
      "author",
      "url",
      "form",
      "audience",
      "partner",
    ].every((key) => !(key in entry) || typeof entry[key] === "string")
  );
}
