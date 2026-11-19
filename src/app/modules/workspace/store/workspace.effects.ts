import { inject, Injectable } from "@angular/core";
import { Actions, createEffect, ofType } from "@ngrx/effects";
import { Store } from "@ngrx/store";
import {
  catchError,
  delay,
  exhaustMap,
  forkJoin,
  map,
  of,
  switchMap,
  withLatestFrom,
  throwIfEmpty,
} from "rxjs";
import {
  FrontendOperationError,
  PORTAL_PROVIDER,
} from "../../../core/data/portal-provider";
import { PortalErrorService } from "../../../core/errors/portal-error.service";
import { PermissionPolicyService } from "../../../core/auth/permission-policy.service";
import {
  FrontendAccessRequest,
  FrontendReservation,
} from "../../../data/frontend.models";
import { selectSession } from "../../../store/session/session.store";
import * as A from "./workspace.store";
export function requireResponse<
  T extends FrontendReservation | FrontendAccessRequest,
>(value: T): T {
  if (!value?.id) throw new FrontendOperationError("invalid-response");
  return value;
}
@Injectable()
export class WorkspaceEffects {
  private readonly actions$ = inject(Actions);
  private readonly store = inject(Store);
  private readonly provider = inject(PORTAL_PROVIDER);
  private readonly errors = inject(PortalErrorService);
  private readonly policy = inject(PermissionPolicyService);
  private readonly session$ = this.store.select(selectSession);
  readonly load$ = createEffect(() =>
    this.actions$.pipe(
      ofType(A.loadWorkspace),
      withLatestFrom(this.session$),
      switchMap(([{ scope }, session]) => {
        if (
          !this.policy.canAccess(
            session.role,
            scope === "mine" ? "student" : "management",
          )
        )
          return of(
            A.workspaceFailed({
              error: this.errors.message(
                new FrontendOperationError("forbidden"),
              ),
            }),
          );
        const ownerId = scope === "mine" ? session.id : undefined;
        return forkJoin({
          resources: this.provider.resources(),
          bookings: this.provider.reservations(ownerId),
          access: this.provider.accessRequests(ownerId),
        }).pipe(
          map((data) => A.workspaceLoaded(data)),
          catchError((error) =>
            of(A.workspaceFailed({ error: this.errors.message(error) })),
          ),
        );
      }),
    ),
  );
  // Krátke oneskorenie simuluje asynchrónnu odpoveď dema a chráni opakované kliknutie.
  readonly createBooking$ = createEffect(() =>
    this.actions$.pipe(
      ofType(A.createBooking),
      withLatestFrom(this.session$),
      exhaustMap(([{ draft }, session]) =>
        this.provider.createReservation(draft, session.id).pipe(
          throwIfEmpty(() => new FrontendOperationError("invalid-response")),
          delay(150),
          map((value) => A.bookingCreated({ booking: requireResponse(value) })),
          catchError((e) =>
            of(A.operationFailed({ error: this.errors.message(e) })),
          ),
        ),
      ),
    ),
  );
  readonly cancel$ = createEffect(() =>
    this.actions$.pipe(
      ofType(A.cancelBooking),
      withLatestFrom(this.session$),
      exhaustMap(([{ id }, session]) =>
        this.provider.cancelReservation(id, session.id).pipe(
          throwIfEmpty(() => new FrontendOperationError("invalid-response")),
          delay(150),
          map((value) =>
            A.bookingCancelled({ booking: requireResponse(value) }),
          ),
          catchError((e) =>
            of(A.operationFailed({ error: this.errors.message(e) })),
          ),
        ),
      ),
    ),
  );
  readonly access$ = createEffect(() =>
    this.actions$.pipe(
      ofType(A.createAccess),
      withLatestFrom(this.session$),
      exhaustMap(([{ draft }, session]) =>
        this.provider.createAccess(draft, session.id).pipe(
          throwIfEmpty(() => new FrontendOperationError("invalid-response")),
          delay(150),
          map((value) => A.accessCreated({ request: requireResponse(value) })),
          catchError((e) =>
            of(A.operationFailed({ error: this.errors.message(e) })),
          ),
        ),
      ),
    ),
  );
  readonly decision$ = createEffect(() =>
    this.actions$.pipe(
      ofType(A.makeDecision),
      withLatestFrom(this.session$),
      exhaustMap(([{ decision }, session]) =>
        this.provider.decide(decision, session.role).pipe(
          throwIfEmpty(() => new FrontendOperationError("invalid-response")),
          delay(150),
          map((value) =>
            A.decisionMade({
              kind: decision.kind,
              item: requireResponse(value),
            }),
          ),
          catchError((e) =>
            of(A.operationFailed({ error: this.errors.message(e) })),
          ),
        ),
      ),
    ),
  );
}
