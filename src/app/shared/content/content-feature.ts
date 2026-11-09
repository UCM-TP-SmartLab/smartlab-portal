import { inject, Injectable } from "@angular/core";
import {
  createAction,
  createFeatureSelector,
  createReducer,
  createSelector,
  on,
  props,
} from "@ngrx/store";
import { Actions, createEffect, ofType } from "@ngrx/effects";
import { catchError, map, of, switchMap } from "rxjs";
import {
  FrontendContentEntry,
  UiContentKind,
} from "../../data/frontend.models";
import { PORTAL_PROVIDER } from "../../core/data/portal-provider";
import { PortalErrorService } from "../../core/errors/portal-error.service";
export interface ContentState {
  entries: readonly FrontendContentEntry[];
  loading: boolean;
  error: string | null;
}
export function createContentFeature(key: string, kind: UiContentKind) {
  const load = createAction(`[${key}] Načítať`);
  const loaded = createAction(
    `[${key}] Načítané`,
    props<{ entries: readonly FrontendContentEntry[] }>(),
  );
  const failed = createAction(`[${key}] Chyba`, props<{ error: string }>());
  const initial: ContentState = { entries: [], loading: false, error: null };
  const reducer = createReducer(
    initial,
    on(load, (state) => ({ ...state, loading: true, error: null })),
    on(loaded, (state, { entries }) => ({ ...state, entries, loading: false })),
    on(failed, (state, { error }) => ({ ...state, loading: false, error })),
  );
  const selectState = createFeatureSelector<ContentState>(key);
  const entries = createSelector(selectState, (s) => s.entries);
  const loading = createSelector(selectState, (s) => s.loading);
  const error = createSelector(selectState, (s) => s.error);
  @Injectable()
  class ContentEffects {
    private readonly actions$ = inject(Actions);
    private readonly provider = inject(PORTAL_PROVIDER);
    private readonly errors = inject(PortalErrorService);
    readonly load$ = createEffect(() =>
      this.actions$.pipe(
        ofType(load),
        switchMap(() =>
          this.provider.content(kind).pipe(
            map((entries) => loaded({ entries })),
            catchError((error) =>
              of(failed({ error: this.errors.message(error) })),
            ),
          ),
        ),
      ),
    );
  }
  return {
    key,
    kind,
    load,
    loaded,
    failed,
    reducer,
    entries,
    loading,
    error,
    Effects: ContentEffects,
  };
}
