import {
  createAction,
  createFeatureSelector,
  createReducer,
  createSelector,
  on,
  props,
} from "@ngrx/store";
import { UiRole } from "../../../data/frontend.models";
import { sessionLoaded } from "../../../store/session/session.store";

export type AdminRole = Exclude<UiRole, UiRole.Visitor>;
export interface AdminResourceInput {
  type: "room" | "equipment";
  name: string;
  description: string;
  location: string;
  capacity: number | null;
  quantity: number | null;
}
export interface AdminResource extends AdminResourceInput {
  id: string;
  archivedAt: string | null;
}
export interface AdminUser {
  id: string;
  name: string;
  email: string;
  active: boolean;
  roles: AdminRole[];
}
export const loadAdminResources = createAction("[Správa zdrojov] Načítať");
export const loadAdminUsers = createAction("[Správa rolí] Načítať");
export const adminResourcesLoaded = createAction(
  "[Správa zdrojov] Načítané",
  props<{ resources: AdminResource[] }>(),
);
export const adminUsersLoaded = createAction(
  "[Správa rolí] Načítané",
  props<{ users: AdminUser[]; roles: AdminRole[] }>(),
);
export const saveAdminResource = createAction(
  "[Správa zdrojov] Uložiť",
  props<{ id: string | null; resource: AdminResourceInput }>(),
);
export const archiveAdminResource = createAction(
  "[Správa zdrojov] Archivovať",
  props<{ id: string }>(),
);
export const adminResourceSaved = createAction(
  "[Správa zdrojov] Uložené",
  props<{ resource: AdminResource }>(),
);
export const uploadAdminImage = createAction(
  "[Správa zdrojov] Nahrať fotografiu",
  props<{ id: string; file: File }>(),
);
export const adminImageUploaded = createAction(
  "[Správa zdrojov] Fotografia nahratá",
);
export const saveAdminRoles = createAction(
  "[Správa rolí] Uložiť",
  props<{ id: string; roles: AdminRole[] }>(),
);
export const adminRolesSaved = createAction(
  "[Správa rolí] Uložené",
  props<{ user: AdminUser }>(),
);
export const adminFailed = createAction(
  "[Správa] Chyba",
  props<{ error: string }>(),
);

interface AdminState {
  resources: AdminResource[];
  users: AdminUser[];
  roles: AdminRole[];
  busy: boolean;
  error: string | null;
  notice: string | null;
  savedResource: AdminResource | null;
}
const initial: AdminState = {
  resources: [],
  users: [],
  roles: [],
  busy: false,
  error: null,
  notice: null,
  savedResource: null,
};
export const adminReducer = createReducer(
  initial,
  on(sessionLoaded, () => initial),
  on(
    loadAdminResources,
    loadAdminUsers,
    saveAdminResource,
    archiveAdminResource,
    uploadAdminImage,
    saveAdminRoles,
    (state) => ({
      ...state,
      busy: true,
      error: null,
      notice: null,
      savedResource: null,
    }),
  ),
  on(adminResourcesLoaded, (state, { resources }) => ({
    ...state,
    resources,
    busy: false,
  })),
  on(adminUsersLoaded, (state, { users, roles }) => ({
    ...state,
    users,
    roles,
    busy: false,
  })),
  on(adminResourceSaved, (state, { resource }) => ({
    ...state,
    busy: false,
    notice: "Zdroj bol uložený.",
    savedResource: resource,
    resources: state.resources.some(({ id }) => id === resource.id)
      ? state.resources.map((item) =>
          item.id === resource.id ? resource : item,
        )
      : [...state.resources, resource],
  })),
  on(adminImageUploaded, (state) => ({
    ...state,
    busy: false,
    notice: "Fotografia bola nahratá.",
  })),
  on(adminRolesSaved, (state, { user }) => ({
    ...state,
    busy: false,
    notice: "Roly boli uložené.",
    users: state.users.map((item) => (item.id === user.id ? user : item)),
  })),
  on(adminFailed, (state, { error }) => ({ ...state, busy: false, error })),
);
const selectAdmin = createFeatureSelector<AdminState>("admin");
export const selectAdminResources = createSelector(
  selectAdmin,
  (state) => state.resources,
);
export const selectAdminUsers = createSelector(
  selectAdmin,
  (state) => state.users,
);
export const selectAdminRoles = createSelector(
  selectAdmin,
  (state) => state.roles,
);
export const selectAdminBusy = createSelector(
  selectAdmin,
  (state) => state.busy,
);
export const selectAdminError = createSelector(
  selectAdmin,
  (state) => state.error,
);
export const selectAdminNotice = createSelector(
  selectAdmin,
  (state) => state.notice,
);
export const selectSavedResource = createSelector(
  selectAdmin,
  (state) => state.savedResource,
);
