import { isPlatformBrowser } from "@angular/common";
import { inject, PLATFORM_ID } from "@angular/core";
import { CanActivateFn, Router } from "@angular/router";
import { Store } from "@ngrx/store";
import { filter, map, take } from "rxjs";
import { PORTAL_CONFIG } from "../../config/portal.config";
import { UiArea } from "../../data/frontend.models";
import { loadSession, selectSession } from "../../store/session/session.store";
import { PermissionPolicyService } from "./permission-policy.service";
export function roleGuard(area: UiArea): CanActivateFn {
  return (_route, state) => {
    const config = inject(PORTAL_CONFIG);
    const router = inject(Router);
    const policy = inject(PermissionPolicyService);
    const login =
      area === "student" ? "/prihlasenie" : "/administracia/prihlasenie";
    if (!config.demo && !isPlatformBrowser(inject(PLATFORM_ID)))
      return router.createUrlTree([login], {
        queryParams: { returnUrl: state.url },
      });
    const store = inject(Store);
    if (!config.demo) store.dispatch(loadSession());
    return store.select(selectSession).pipe(
      filter((session) => config.demo || session.ready),
      take(1),
      map(
        ({ role, id }) =>
          policy.canAccess(role, area) ||
          router.createUrlTree([login], {
            queryParams: {
              returnUrl: state.url,
              denied: id || config.demo ? "1" : undefined,
            },
          }),
      ),
    );
  };
}
