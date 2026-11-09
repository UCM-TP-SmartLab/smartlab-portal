import { NgModule } from "@angular/core";
import { SharedModule } from "../../shared/shared.module";
import { ManagementComponent } from "./view/management.component";
import { ManagementRoutingModule } from "./management-routing.module";
@NgModule({
  declarations: [ManagementComponent],
  imports: [SharedModule, ManagementRoutingModule],
})
export class ManagementModule {}
