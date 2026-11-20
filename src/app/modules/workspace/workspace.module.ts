import { NgModule } from "@angular/core";
import { RouterModule } from "@angular/router";
import { StoreModule } from "@ngrx/store";
import { EffectsModule } from "@ngrx/effects";
import { roleGuard } from "../../core/auth/role.guard";
import { workspaceReducer } from "./store/workspace.store";
import { WorkspaceEffects } from "./store/workspace.effects";
@NgModule({
  imports: [
    StoreModule.forFeature("workspace", workspaceReducer),
    EffectsModule.forFeature([WorkspaceEffects]),
    RouterModule.forChild([
      {
        path: "rezervacie",
        canActivate: [roleGuard("student")],
        loadChildren: () =>
          import("../reservations/reservations.module").then(
            (m) => m.ReservationsModule,
          ),
      },
      {
        path: "ziadosti-o-pristup",
        canActivate: [roleGuard("student")],
        loadChildren: () =>
          import("../access-requests/access-requests.module").then(
            (m) => m.AccessRequestsModule,
          ),
      },
      {
        path: "administracia",
        canActivate: [roleGuard("management")],
        loadChildren: () =>
          import("../management/management.module").then(
            (m) => m.ManagementModule,
          ),
      },
    ]),
  ],
})
export class WorkspaceModule {}
