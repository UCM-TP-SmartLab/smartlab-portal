import { NgModule } from "@angular/core";
import { RouterModule } from "@angular/router";
import { roleGuard } from "../../core/auth/role.guard";
import { ManagementComponent } from "./view/management.component";
@NgModule({
  imports: [
    RouterModule.forChild([
      { path: "", component: ManagementComponent, data: { page: "queue" } },
      {
        path: "ziadost/:kind/:id",
        component: ManagementComponent,
        data: { page: "queue" },
      },
      {
        path: "zdroje",
        component: ManagementComponent,
        canActivate: [roleGuard("admin")],
        data: { page: "resources" },
      },
      {
        path: "roly",
        component: ManagementComponent,
        canActivate: [roleGuard("admin")],
        data: { page: "roles" },
      },
    ]),
  ],
  exports: [RouterModule],
})
export class ManagementRoutingModule {}
