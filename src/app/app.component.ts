import { isPlatformBrowser } from "@angular/common";
import { Component, inject, PLATFORM_ID } from "@angular/core";
import { Store } from "@ngrx/store";
import { PORTAL_CONFIG } from "./config/portal.config";
import { NAVIGATION } from "./config/navigation";
import { ROLE_LABELS, UiRole } from "./data/frontend.models";
import {
  loadSession,
  logout,
  selectRole,
  selectSession,
} from "./store/session/session.store";
@Component({
  selector: "app-root",
  standalone: false,
  templateUrl: "./app.component.html",
})
export class AppComponent {
  readonly config = inject(PORTAL_CONFIG);
  readonly navigation = NAVIGATION;
  private readonly store = inject(Store);
  readonly role$ = this.store.select(selectRole);
  readonly session$ = this.store.select(selectSession);
  readonly roles = ROLE_LABELS;
  readonly student = UiRole.Student;
  menuOpen = false;
  constructor() {
    if (!this.config.demo && isPlatformBrowser(inject(PLATFORM_ID))) {
      this.store.dispatch(loadSession());
    }
  }
  signOut(): void {
    this.store.dispatch(logout());
  }
  closeMenu(): void {
    this.menuOpen = false;
  }
}
