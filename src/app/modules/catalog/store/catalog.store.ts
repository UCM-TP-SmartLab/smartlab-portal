import { inject, Injectable } from "@angular/core";
import { Actions, createEffect, ofType } from "@ngrx/effects";
import {
  createAction,
  createFeatureSelector,
  createReducer,
  createSelector,
  on,
  props,
} from "@ngrx/store";
import { catchError, map, of, switchMap } from "rxjs";
import { PORTAL_PROVIDER } from "../../../core/data/portal-provider";
import { PortalErrorService } from "../../../core/errors/portal-error.service";
import {
  FrontendAvailabilityInterval,
  FrontendResource,
} from "../../../data/frontend.models";
export const loadResources = createAction("[Katalóg] Načítať zdroje");
export const resourcesLoaded = createAction(
  "[Katalóg] Zdroje načítané",
  props<{ resources: readonly FrontendResource[] }>(),
);
export const resourcesFailed = createAction(
  "[Katalóg] Zdroje chyba",
  props<{ error: string }>(),
);
export const loadAvailability = createAction(
  "[Katalóg] Obsadenosť",
  props<{ resourceId: string; date: string }>(),
);
export const availabilityLoaded = createAction(
  "[Katalóg] Obsadenosť načítaná",
  props<{ intervals: readonly FrontendAvailabilityInterval[] }>(),
);
export const availabilityFailed = createAction(
  "[Katalóg] Obsadenosť chyba",
  props<{ error: string }>(),
);
interface CatalogState {
  resources: readonly FrontendResource[];
  loading: boolean;
  error: string | null;
  intervals: readonly FrontendAvailabilityInterval[];
  availabilityLoading: boolean;
  availabilityError: string | null;
  availabilityKnown: boolean;
}
const initial: CatalogState = {
  resources: [],
  loading: false,
  error: null,
  intervals: [],
  availabilityLoading: false,
  availabilityError: null,
  availabilityKnown: false,
};
export const catalogReducer = createReducer(
  initial,
  on(loadResources, (s) => ({ ...s, loading: true, error: null })),
  on(resourcesLoaded, (s, { resources }) => ({
    ...s,
    resources,
    loading: false,
  })),
  on(resourcesFailed, (s, { error }) => ({ ...s, error, loading: false })),
  on(loadAvailability, (s) => ({
    ...s,
    intervals: [],
    availabilityLoading: true,
    availabilityKnown: false,
    availabilityError: null,
  })),
  on(availabilityLoaded, (s, { intervals }) => ({
    ...s,
    intervals,
    availabilityLoading: false,
    availabilityKnown: true,
  })),
  on(availabilityFailed, (s, { error }) => ({
    ...s,
    intervals: [],
    availabilityLoading: false,
    availabilityKnown: false,
    availabilityError: error,
  })),
);
const state = createFeatureSelector<CatalogState>("catalog");
export const selectResources = createSelector(state, (s) => s.resources);
export const selectResourcesLoading = createSelector(state, (s) => s.loading);
export const selectResourcesError = createSelector(state, (s) => s.error);
export const selectIntervals = createSelector(state, (s) => s.intervals);
export const selectAvailabilityLoading = createSelector(
  state,
  (s) => s.availabilityLoading,
);
export const selectAvailabilityError = createSelector(
  state,
  (s) => s.availabilityError,
);
export const selectAvailabilityKnown = createSelector(
  state,
  (s) => s.availabilityKnown,
);
@Injectable()
export class CatalogEffects {
  private readonly actions$ = inject(Actions);
  private readonly provider = inject(PORTAL_PROVIDER);
  private readonly errors = inject(PortalErrorService);
  readonly resources$ = createEffect(() =>
    this.actions$.pipe(
      ofType(loadResources),
      switchMap(() =>
        this.provider.resources().pipe(
          map((resources) => resourcesLoaded({ resources })),
          catchError((e) =>
            of(resourcesFailed({ error: this.errors.message(e) })),
          ),
        ),
      ),
    ),
  );
  readonly availability$ = createEffect(() =>
    this.actions$.pipe(
      ofType(loadAvailability),
      switchMap(({ resourceId, date }) =>
        this.provider.availability(resourceId, date).pipe(
          map((intervals) => availabilityLoaded({ intervals })),
          catchError((e) =>
            of(availabilityFailed({ error: this.errors.message(e) })),
          ),
        ),
      ),
    ),
  );
}
