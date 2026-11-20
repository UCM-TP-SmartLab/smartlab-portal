import { NgModule } from "@angular/core";
import { RouterModule } from "@angular/router";
import { AccessRequestsComponent } from "./view/access-requests.component";
@NgModule({
  imports: [
    RouterModule.forChild([{ path: "", component: AccessRequestsComponent }]),
  ],
  exports: [RouterModule],
})
export class AccessRequestsRoutingModule {}
