import { NgModule } from "@angular/core";
import { SharedModule } from "../../shared/shared.module";
import { ReservationsRoutingModule } from "./reservations-routing.module";
import { CreateReservationComponent } from "./view/create-reservation.component";
import { ReservationListComponent } from "./view/reservation-list.component";
@NgModule({
  declarations: [CreateReservationComponent, ReservationListComponent],
  imports: [SharedModule, ReservationsRoutingModule],
})
export class ReservationsModule {}
