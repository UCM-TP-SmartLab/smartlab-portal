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
export const sessionInitial: FrontendSession = {
  id: "",
  role: UiRole.Visitor,
  name: "Návštevník",
};
export const sessionReducer = createReducer(
  sessionInitial,
  on(chooseDemoRole, (_state, { role }) => ({
    id: role === UiRole.Visitor ? "" : `demo-${role}`,
    role,
    name: `Demo ${role}`,
  })),
);
export const selectSession = createFeatureSelector<FrontendSession>("session");
export const selectRole = createSelector(selectSession, (state) => state.role);
