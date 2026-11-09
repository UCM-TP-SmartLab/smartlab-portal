import { NgModule } from "@angular/core";
import { SharedModule } from "../../shared/shared.module";
import { AvailabilityComponent } from "./view/availability.component";
import { AvailabilityRoutingModule } from "./availability-routing.module";
@NgModule({
  declarations: [AvailabilityComponent],
  imports: [SharedModule, AvailabilityRoutingModule],
})
export class AvailabilityModule {}
