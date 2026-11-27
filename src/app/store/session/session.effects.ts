import { HttpClient, HttpErrorResponse } from "@angular/common/http";
import { Injectable, inject } from "@angular/core";
import { Router } from "@angular/router";
import { Actions, createEffect, ofType } from "@ngrx/effects";
import { Store } from "@ngrx/store";
import { catchError, exhaustMap, filter, map, of, withLatestFrom } from "rxjs";
import { API_BASE_URL } from "../../config/api.config";
import { PermissionPolicyService } from "../../core/auth/permission-policy.service";
import { FrontendSession, UiRole } from "../../data/frontend.models";
import {
  loadSession,
  login,
  logout,
  selectSession,
  sessionFailed,
  sessionLoaded,
} from "./session.store";

interface SessionResponse {
  data: { session: FrontendSession | null; csrfToken: string | null };
}

@Injectable()
export class SessionEffects {
  private readonly actions = inject(Actions);
  private readonly http = inject(HttpClient);
  private readonly router = inject(Router);
  private readonly policy = inject(PermissionPolicyService);
  private readonly store = inject(Store);
  private readonly base = inject(API_BASE_URL);

  readonly load = createEffect(() =>
    this.actions.pipe(
      ofType(loadSession),
      withLatestFrom(this.store.select(selectSession)),
      filter(([, session]) => !session.ready),
      exhaustMap(() =>
        this.http
          .get<SessionResponse>(`${this.base}/auth/me`, { timeout: 10000 })
          .pipe(
            map(readSession),
            catchError(() =>
              of(sessionFailed({ error: "Reláciu sa nepodarilo overiť." })),
            ),
          ),
      ),
    ),
  );

  readonly signIn = createEffect(() =>
    this.actions.pipe(
      ofType(login),
      exhaustMap(({ email, password, destination, area }) =>
        this.http
          .post<SessionResponse>(`${this.base}/auth/login`, { email, password })
          .pipe(
            map(readSession),
            // Zmena relácie predchádza navigácii, aby guard čítal potvrdenú identitu.
            map((action) => {
              if (!action.session) throw new Error("Chýba potvrdená identita.");
              const role = action.session.role;
              const target = this.policy.canAccess(role, area)
                ? destination
                : role === UiRole.Student
                  ? "/rezervacie"
                  : "/administracia";
              void Promise.resolve().then(() =>
                this.router.navigateByUrl(target),
              );
              return action;
            }),
            catchError((error: unknown) =>
              of(
                sessionFailed({
                  error:
                    error instanceof HttpErrorResponse && error.status === 401
                      ? "Prihlásenie sa nepodarilo. Skontrolujte údaje alebo skúste neskôr."
                      : "Prihlásenie je dočasne nedostupné.",
                }),
              ),
            ),
          ),
      ),
    ),
  );

  readonly signOut = createEffect(() =>
    this.actions.pipe(
      ofType(logout),
      withLatestFrom(this.store.select(selectSession)),
      exhaustMap(([, session]) =>
        this.http
          .post<SessionResponse>(
            `${this.base}/auth/logout`,
            {},
            { headers: { "X-CSRF-Token": session.csrfToken ?? "" } },
          )
          .pipe(
            map((response) => {
              const action = readSession(response);
              void Promise.resolve().then(() =>
                this.router.navigateByUrl("/domov"),
              );
              return action;
            }),
            catchError(() =>
              of(sessionFailed({ error: "Odhlásenie sa nepodarilo." })),
            ),
          ),
      ),
    ),
  );
}

function readSession(response: SessionResponse) {
  const data = response?.data;
  if (data?.session === null && data.csrfToken === null)
    return sessionLoaded(data);
  const identity = data?.session;
  if (
    !identity ||
    typeof identity.id !== "string" ||
    !identity.id ||
    typeof identity.name !== "string" ||
    ![UiRole.Student, UiRole.Manager, UiRole.Admin].includes(identity.role) ||
    typeof data.csrfToken !== "string" ||
    !data.csrfToken
  ) {
    throw new Error("Neplatná identita relácie.");
  }
  return sessionLoaded(data);
}
