import { Component, inject } from "@angular/core";
import { ActivatedRoute, Router } from "@angular/router";
import { Store } from "@ngrx/store";
import { NonNullableFormBuilder, Validators } from "@angular/forms";
import { PORTAL_CONFIG } from "../../../config/portal.config";
import { UiRole, ROLE_LABELS } from "../../../data/frontend.models";
import {
  chooseDemoRole,
  login,
  selectSession,
} from "../../../store/session/session.store";
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
  readonly session$ = this.store.select(selectSession);
  readonly form = inject(NonNullableFormBuilder).group({
    email: ["", [Validators.required, Validators.email]],
    password: ["", Validators.required],
  });
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
    void this.router.navigateByUrl(this.destination());
  }
  signIn(): void {
    if (this.form.invalid) return;
    this.store.dispatch(
      login({
        ...this.form.getRawValue(),
        destination: this.destination(),
        area: this.management ? "management" : "student",
      }),
    );
  }
  private destination(): string {
    const target = this.route.snapshot.queryParamMap.get("returnUrl");
    const allowed =
      target &&
      /^\/(rezervacie|ziadosti-o-pristup|administracia)(\/|\?|$)/.test(
        target,
      ) &&
      !target.startsWith("/administracia/prihlasenie");
    let destination = this.management ? "/administracia" : "/rezervacie";
    if (allowed && target) destination = target;
    return destination;
  }
}
