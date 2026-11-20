import { NgModule } from "@angular/core";
import { RouterModule } from "@angular/router";
import { EventsComponent } from "./view/events.component";
@NgModule({
  imports: [
    RouterModule.forChild([
      { path: "", component: EventsComponent },
      { path: ":slug", component: EventsComponent },
    ]),
  ],
  exports: [RouterModule],
})
export class EventsRoutingModule {}
