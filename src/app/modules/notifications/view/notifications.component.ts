import { Component, inject } from "@angular/core";
import { Store } from "@ngrx/store";
import * as N from "../store/notifications.store";

@Component({
  selector: "sl-notifications",
  standalone: false,
  templateUrl: "./notifications.component.html",
})
export class NotificationsComponent {
  private readonly store = inject(Store);
  readonly items$ = this.store.select(N.selectNotificationItems);
  readonly busy$ = this.store.select(N.selectNotificationBusy);
  readonly error$ = this.store.select(N.selectNotificationError);
  open = false;

  toggle(): void {
    this.open = !this.open;
    if (this.open) this.store.dispatch(N.loadNotifications());
  }
  read(id: string): void {
    this.store.dispatch(N.markRead({ id }));
  }
}
