import { inject } from "@angular/core";
import { CanActivateFn, Router } from "@angular/router";
import { Store } from "@ngrx/store";
import { map, take } from "rxjs";
import { PORTAL_CONFIG } from "../../config/portal.config";
import { UiArea } from "../../data/frontend.models";
import { selectRole } from "../../store/session/session.store";
import { PermissionPolicyService } from "./permission-policy.service";
export function roleGuard(area: UiArea): CanActivateFn {
  return (_route, state) => {
    const config = inject(PORTAL_CONFIG);
    const router = inject(Router);
    const policy = inject(PermissionPolicyService);
    const login =
      area === "student" ? "/prihlasenie" : "/administracia/prihlasenie";
    if (!config.demo)
      return router.createUrlTree([login], {
        queryParams: { returnUrl: state.url },
      });
    return inject(Store)
      .select(selectRole)
      .pipe(
        take(1),
        map(
          (role) =>
            policy.canAccess(role, area) ||
            router.createUrlTree([login], {
              queryParams: { returnUrl: state.url, denied: "1" },
            }),
        ),
      );
  };
}
