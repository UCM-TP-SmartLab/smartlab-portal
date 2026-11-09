import { NgModule } from "@angular/core";
import { RouterModule } from "@angular/router";
import { AvailabilityComponent } from "./view/availability.component";
@NgModule({
  imports: [
    RouterModule.forChild([{ path: "", component: AvailabilityComponent }]),
  ],
  exports: [RouterModule],
})
export class AvailabilityRoutingModule {}
