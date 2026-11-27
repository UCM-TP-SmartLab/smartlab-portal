import { HttpClient } from "@angular/common/http";
import { Injectable, inject } from "@angular/core";
import { Actions, createEffect, ofType } from "@ngrx/effects";
import { Store } from "@ngrx/store";
import {
  catchError,
  exhaustMap,
  map,
  of,
  takeUntil,
  withLatestFrom,
} from "rxjs";
import { API_BASE_URL } from "../../../config/api.config";
import { PortalErrorService } from "../../../core/errors/portal-error.service";
import {
  selectSession,
  sessionLoaded,
} from "../../../store/session/session.store";
import * as N from "./notifications.store";

@Injectable()
export class NotificationEffects {
  private readonly actions = inject(Actions);
  private readonly store = inject(Store);
  private readonly http = inject(HttpClient);
  private readonly errors = inject(PortalErrorService);
  private readonly url = inject(API_BASE_URL) + "/me/notifications";

  readonly load = createEffect(() =>
    this.actions.pipe(
      ofType(N.loadNotifications),
      exhaustMap(() =>
        this.http.get<{ data: N.Notification[] }>(this.url).pipe(
          map(({ data }) => N.notificationsLoaded({ notifications: data })),
          catchError(this.failure),
          takeUntil(this.actions.pipe(ofType(sessionLoaded))),
        ),
      ),
    ),
  );
  readonly read = createEffect(() =>
    this.actions.pipe(
      ofType(N.markRead),
      withLatestFrom(this.store.select(selectSession)),
      exhaustMap(([{ id }, { csrfToken }]) =>
        this.http
          .patch<{
            data: N.Notification;
          }>(this.url + "/" + encodeURIComponent(id), {}, { headers: { "X-CSRF-Token": csrfToken ?? "" } })
          .pipe(
            map(({ data }) => N.notificationRead({ notification: data })),
            catchError(this.failure),
            takeUntil(this.actions.pipe(ofType(sessionLoaded))),
          ),
      ),
    ),
  );

  private readonly failure = (error: unknown) =>
    of(N.notificationsFailed({ error: this.errors.message(error) }));
}
