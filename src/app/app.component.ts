import { Component, inject } from "@angular/core";
import { Store } from "@ngrx/store";
import { PORTAL_CONFIG } from "./config/portal.config";
import { NAVIGATION } from "./config/navigation";
import { ROLE_LABELS } from "./data/frontend.models";
import { selectRole } from "./store/session/session.store";
@Component({
  selector: "app-root",
  standalone: false,
  templateUrl: "./app.component.html",
})
export class AppComponent {
  readonly config = inject(PORTAL_CONFIG);
  readonly navigation = NAVIGATION;
  readonly role$ = inject(Store).select(selectRole);
  readonly roles = ROLE_LABELS;
  menuOpen = false;
  closeMenu(): void {
    this.menuOpen = false;
  }
}
