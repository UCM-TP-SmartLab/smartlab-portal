import {
  createAction,
  createFeatureSelector,
  createReducer,
  createSelector,
  on,
  props,
} from "@ngrx/store";
import {
  FrontendAccessDraft,
  FrontendAccessRequest,
  FrontendDecision,
  FrontendReservation,
  FrontendReservationDraft,
  FrontendResource,
} from "../../../data/frontend.models";
import { sessionLoaded } from "../../../store/session/session.store";
export const loadWorkspace = createAction(
  "[Pracovný priestor] Načítať",
  props<{ scope: "mine" | "management" }>(),
);
export const workspaceLoaded = createAction(
  "[Pracovný priestor] Načítaný",
  props<{
    resources: readonly FrontendResource[];
    bookings: readonly FrontendReservation[];
    access: readonly FrontendAccessRequest[];
  }>(),
);
export const workspaceFailed = createAction(
  "[Pracovný priestor] Chyba načítania",
  props<{ error: string }>(),
);
export const createBooking = createAction(
  "[Rezervácie] Vytvoriť",
  props<{ draft: FrontendReservationDraft }>(),
);
export const bookingCreated = createAction(
  "[Rezervácie] Vytvorená",
  props<{ booking: FrontendReservation }>(),
);
export const cancelBooking = createAction(
  "[Rezervácie] Zrušiť",
  props<{ id: string }>(),
);
export const bookingCancelled = createAction(
  "[Rezervácie] Zrušená",
  props<{ booking: FrontendReservation }>(),
);
export const createAccess = createAction(
  "[Prístup] Vytvoriť",
  props<{ draft: FrontendAccessDraft }>(),
);
export const accessCreated = createAction(
  "[Prístup] Vytvorený",
  props<{ request: FrontendAccessRequest }>(),
);
export const makeDecision = createAction(
  "[Správa] Rozhodnúť",
  props<{ decision: FrontendDecision }>(),
);
export const decisionMade = createAction(
  "[Správa] Rozhodnuté",
  props<{
    kind: "reservation" | "access";
    item: FrontendReservation | FrontendAccessRequest;
  }>(),
);
export const operationFailed = createAction(
  "[Pracovný priestor] Operácia zlyhala",
  props<{ error: string }>(),
);
export const clearOperation = createAction(
  "[Pracovný priestor] Vyčistiť výsledok",
);
export interface WorkspaceState {
  resources: readonly FrontendResource[];
  bookings: readonly FrontendReservation[];
  access: readonly FrontendAccessRequest[];
  loading: boolean;
  busy: boolean;
  error: string | null;
  loadError: string | null;
  notice: string | null;
  createdId: string | null;
}
export const initialWorkspace: WorkspaceState = {
  resources: [],
  bookings: [],
  access: [],
  loading: false,
  busy: false,
  error: null,
  loadError: null,
  notice: null,
  createdId: null,
};
const busy = (s: WorkspaceState) => ({
  ...s,
  busy: true,
  error: null,
  notice: null,
  createdId: null,
});
export const workspaceReducer = createReducer(
  initialWorkspace,
  on(sessionLoaded, () => initialWorkspace),
  on(loadWorkspace, (s) => ({ ...s, loading: true, loadError: null })),
  on(workspaceLoaded, (s, data) => ({
    ...s,
    resources: data.resources,
    bookings: data.bookings,
    access: data.access,
    loading: false,
  })),
  on(workspaceFailed, (s, { error }) => ({
    ...s,
    loading: false,
    loadError: error,
  })),
  on(createBooking, createAccess, cancelBooking, makeDecision, busy),
  on(bookingCreated, (s, { booking }) => ({
    ...s,
    bookings: [...s.bookings.filter((b) => b.id !== booking.id), booking],
    busy: false,
    notice: "Rezervácia bola vytvorená.",
    createdId: booking.id,
  })),
  on(bookingCancelled, (s, { booking }) => ({
    ...s,
    bookings: s.bookings.map((b) => (b.id === booking.id ? booking : b)),
    busy: false,
    notice: "Rezervácia bola zrušená.",
  })),
  on(accessCreated, (s, { request }) => ({
    ...s,
    access: [...s.access.filter((a) => a.id !== request.id), request],
    busy: false,
    notice: "Žiadosť bola vytvorená.",
    createdId: request.id,
  })),
  on(decisionMade, (s, { kind, item }) => ({
    ...s,
    bookings:
      kind === "reservation"
        ? s.bookings.map((b) =>
            b.id === item.id ? (item as FrontendReservation) : b,
          )
        : s.bookings,
    access:
      kind === "access"
        ? s.access.map((a) => (a.id === item.id ? item : a))
        : s.access,
    busy: false,
    notice: "Rozhodnutie bolo uložené.",
  })),
  on(operationFailed, (s, { error }) => ({ ...s, error, busy: false })),
  on(clearOperation, (s) => ({
    ...s,
    error: null,
    notice: null,
    createdId: null,
  })),
);
const state = createFeatureSelector<WorkspaceState>("workspace");
export const selectBookings = createSelector(state, (s) => s.bookings);
export const selectAccess = createSelector(state, (s) => s.access);
export const selectWorkspaceResources = createSelector(
  state,
  (s) => s.resources,
);
export const selectLoading = createSelector(state, (s) => s.loading);
export const selectBusy = createSelector(state, (s) => s.busy);
export const selectError = createSelector(state, (s) => s.error);
export const selectLoadError = createSelector(state, (s) => s.loadError);
export const selectNotice = createSelector(state, (s) => s.notice);
export const selectCreatedId = createSelector(state, (s) => s.createdId);
