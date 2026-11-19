import { NgModule } from "@angular/core";
import { RouterModule } from "@angular/router";
import { CreateReservationComponent } from "./view/create-reservation.component";
import { ReservationListComponent } from "./view/reservation-list.component";
@NgModule({
  imports: [
    RouterModule.forChild([
      { path: "", component: ReservationListComponent },
      { path: "nova", component: CreateReservationComponent },
      { path: ":id", component: ReservationListComponent },
    ]),
  ],
  exports: [RouterModule],
})
export class ReservationsRoutingModule {}
