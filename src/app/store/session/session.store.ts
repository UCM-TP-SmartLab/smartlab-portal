import {
  createAction,
  createFeatureSelector,
  createReducer,
  createSelector,
  on,
  props,
} from "@ngrx/store";
import { FrontendSession, UiRole } from "../../data/frontend.models";
export const chooseDemoRole = createAction(
  "[Demo relácia] Vybrať rolu",
  props<{ role: UiRole }>(),
);
export const loadSession = createAction("[Relácia] Overiť prihlásenie");
export const login = createAction(
  "[Relácia] Prihlásiť",
  props<{
    email: string;
    password: string;
    destination: string;
    area: "student" | "management";
  }>(),
);
export const logout = createAction("[Relácia] Odhlásiť");
export const sessionLoaded = createAction(
  "[Relácia] Identita",
  props<{
    session: FrontendSession | null;
    csrfToken: string | null;
  }>(),
);
export const sessionFailed = createAction(
  "[Relácia] Chyba",
  props<{ error: string }>(),
);
interface SessionState extends FrontendSession {
  ready: boolean;
  pending: boolean;
  error: string | null;
  csrfToken: string | null;
}
export const sessionInitial: SessionState = {
  id: "",
  role: UiRole.Visitor,
  name: "Návštevník",
  ready: false,
  pending: false,
  error: null,
  csrfToken: null,
};
export const sessionReducer = createReducer(
  sessionInitial,
  on(chooseDemoRole, (_state, { role }) => ({
    ...sessionInitial,
    ready: true,
    id: role === UiRole.Visitor ? "" : `demo-${role}`,
    role,
    name: `Demo ${role}`,
  })),
  on(login, logout, (state) => ({ ...state, pending: true, error: null })),
  on(sessionLoaded, (_state, { session, csrfToken }) => ({
    ...sessionInitial,
    ...session,
    csrfToken,
    ready: true,
  })),
  on(sessionFailed, (state, { error }) => ({
    ...state,
    ready: true,
    pending: false,
    error,
  })),
);
export const selectSession = createFeatureSelector<SessionState>("session");
export const selectRole = createSelector(selectSession, (state) => state.role);
