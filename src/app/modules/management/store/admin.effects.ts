import { HttpClient } from "@angular/common/http";
import { Injectable, inject } from "@angular/core";
import { Actions, createEffect, ofType } from "@ngrx/effects";
import { Store } from "@ngrx/store";
import { catchError, concatMap, forkJoin, map, of, withLatestFrom } from "rxjs";
import { API_BASE_URL } from "../../../config/api.config";
import { PortalErrorService } from "../../../core/errors/portal-error.service";
import { selectSession } from "../../../store/session/session.store";
import * as A from "./admin.store";

@Injectable()
export class AdminEffects {
  private readonly actions = inject(Actions);
  private readonly http = inject(HttpClient);
  private readonly base = inject(API_BASE_URL) + "/admin";
  private readonly errors = inject(PortalErrorService);
  private readonly session = inject(Store).select(selectSession);

  readonly resources = createEffect(() =>
    this.actions.pipe(
      ofType(A.loadAdminResources),
      concatMap(() =>
        this.http
          .get<{ data: A.AdminResource[] }>(this.base + "/resources")
          .pipe(
            map(({ data }) => A.adminResourcesLoaded({ resources: data })),
            catchError(this.failure),
          ),
      ),
    ),
  );
  readonly users = createEffect(() =>
    this.actions.pipe(
      ofType(A.loadAdminUsers),
      concatMap(() =>
        forkJoin({
          users: this.http.get<{ data: A.AdminUser[] }>(this.base + "/users"),
          roles: this.http.get<{ data: A.AdminRole[] }>(this.base + "/roles"),
        }).pipe(
          map(({ users, roles }) =>
            A.adminUsersLoaded({ users: users.data, roles: roles.data }),
          ),
          catchError(this.failure),
        ),
      ),
    ),
  );
  readonly resourceChanges = createEffect(() =>
    this.actions.pipe(
      ofType(A.saveAdminResource, A.archiveAdminResource),
      withLatestFrom(this.session),
      concatMap(([action, { csrfToken }]) => {
        const path =
          this.base +
          "/resources" +
          (action.id ? "/" + encodeURIComponent(action.id) : "");
        const method =
          action.type === A.archiveAdminResource.type
            ? "DELETE"
            : action.id
              ? "PATCH"
              : "POST";
        return this.http
          .request<{ data: A.AdminResource }>(method, path, {
            body: "resource" in action ? action.resource : undefined,
            headers: this.headers(csrfToken),
          })
          .pipe(
            map(({ data }) => A.adminResourceSaved({ resource: data })),
            catchError(this.failure),
          );
      }),
    ),
  );
  readonly images = createEffect(() =>
    this.actions.pipe(
      ofType(A.uploadAdminImage),
      withLatestFrom(this.session),
      concatMap(([{ id, file }, { csrfToken }]) => {
        const body = new FormData();
        body.set("image", file);
        return this.http
          .post(
            this.base + "/resources/" + encodeURIComponent(id) + "/images",
            body,
            { headers: this.headers(csrfToken) },
          )
          .pipe(
            map(() => A.adminImageUploaded()),
            catchError(this.failure),
          );
      }),
    ),
  );
  readonly roles = createEffect(() =>
    this.actions.pipe(
      ofType(A.saveAdminRoles),
      withLatestFrom(this.session),
      concatMap(([{ id, roles }, { csrfToken }]) =>
        this.http
          .put<{
            data: A.AdminUser;
          }>(this.base + "/users/" + encodeURIComponent(id) + "/roles", { roles }, { headers: this.headers(csrfToken) })
          .pipe(
            map(({ data }) => A.adminRolesSaved({ user: data })),
            catchError(this.failure),
          ),
      ),
    ),
  );

  private readonly failure = (error: unknown) =>
    of(A.adminFailed({ error: this.errors.message(error) }));
  private headers(csrfToken: string | null) {
    return { "X-CSRF-Token": csrfToken ?? "" };
  }
}
