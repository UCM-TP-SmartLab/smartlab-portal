import { NgModule } from "@angular/core";
import { SharedModule } from "../../shared/shared.module";
import { AccessRequestsComponent } from "./view/access-requests.component";
import { AccessRequestsRoutingModule } from "./access-requests-routing.module";
@NgModule({
  declarations: [AccessRequestsComponent],
  imports: [SharedModule, AccessRequestsRoutingModule],
})
export class AccessRequestsModule {}
