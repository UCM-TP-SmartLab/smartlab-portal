import { Component, inject } from "@angular/core";
import { ActivatedRoute, Router } from "@angular/router";
import { Store } from "@ngrx/store";
import { PORTAL_CONFIG } from "../../../config/portal.config";
import { UiRole, ROLE_LABELS } from "../../../data/frontend.models";
import { chooseDemoRole } from "../../../store/session/session.store";
import { SeoService } from "../../../core/seo/seo.service";
@Component({
  selector: "sl-login",
  standalone: false,
  templateUrl: "./login.component.html",
})
export class LoginComponent {
  readonly config = inject(PORTAL_CONFIG);
  private readonly store = inject(Store);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  readonly management = this.route.snapshot.data["management"] === true;
  readonly title = this.management ? "Administrácia" : "Prihlásenie študenta";
  readonly roles = ROLE_LABELS;
  readonly choices = this.management
    ? [UiRole.Manager, UiRole.Admin]
    : [UiRole.Student];
  readonly denied = this.route.snapshot.queryParamMap.has("denied");
  constructor() {
    inject(SeoService).update({
      title: this.title,
      description: "Prístup do chránených častí portálu.",
      path: "/prihlasenie",
      private: true,
    });
  }
  choose(role: UiRole): void {
    if (!this.config.demo || !this.choices.includes(role)) return;
    this.store.dispatch(chooseDemoRole({ role }));
    const target = this.route.snapshot.queryParamMap.get("returnUrl");
    const allowed =
      target &&
      /^\/(rezervacie|ziadosti-o-pristup|administracia)(\/|\?|$)/.test(
        target,
      ) &&
      !target.startsWith("/administracia/prihlasenie");
    let destination = this.management ? "/administracia" : "/rezervacie";
    if (allowed && target) destination = target;
    void this.router.navigateByUrl(destination);
  }
}
