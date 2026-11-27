import {
  createAction,
  createFeatureSelector,
  createReducer,
  createSelector,
  on,
  props,
} from "@ngrx/store";
import { sessionLoaded } from "../../../store/session/session.store";

export interface Notification {
  id: string;
  message: string;
  createdAt: string;
  readAt: string | null;
}
export const loadNotifications = createAction("[Oznámenia] Načítať");
export const notificationsLoaded = createAction(
  "[Oznámenia] Načítané",
  props<{ notifications: Notification[] }>(),
);
export const markRead = createAction(
  "[Oznámenia] Označiť ako prečítané",
  props<{ id: string }>(),
);
export const notificationRead = createAction(
  "[Oznámenia] Prečítané",
  props<{ notification: Notification }>(),
);
export const notificationsFailed = createAction(
  "[Oznámenia] Chyba",
  props<{ error: string }>(),
);
interface NotificationState {
  notifications: Notification[];
  busy: boolean;
  error: string | null;
}
const initial: NotificationState = {
  notifications: [],
  busy: false,
  error: null,
};
export const notificationReducer = createReducer(
  initial,
  on(sessionLoaded, () => initial),
  on(loadNotifications, markRead, (state) => ({
    ...state,
    busy: true,
    error: null,
  })),
  on(notificationsLoaded, (state, { notifications }) => ({
    ...state,
    notifications,
    busy: false,
  })),
  on(notificationRead, (state, { notification }) => ({
    ...state,
    busy: false,
    notifications: state.notifications.map((item) =>
      item.id === notification.id ? notification : item,
    ),
  })),
  on(notificationsFailed, (state, { error }) => ({
    ...state,
    busy: false,
    error,
  })),
);
const selectNotifications =
  createFeatureSelector<NotificationState>("notifications");
export const selectNotificationItems = createSelector(
  selectNotifications,
  (state) => state.notifications,
);
export const selectNotificationBusy = createSelector(
  selectNotifications,
  (state) => state.busy,
);
export const selectNotificationError = createSelector(
  selectNotifications,
  (state) => state.error,
);
