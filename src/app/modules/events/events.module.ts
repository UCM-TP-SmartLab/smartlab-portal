import { NgModule } from "@angular/core";
import { StoreModule } from "@ngrx/store";
import { EffectsModule } from "@ngrx/effects";
import { SharedModule } from "../../shared/shared.module";
import { EventsComponent } from "./view/events.component";
import { EventsRoutingModule } from "./events-routing.module";
import { feature } from "./store/events.store";
@NgModule({
  declarations: [EventsComponent],
  imports: [
    SharedModule,
    EventsRoutingModule,
    StoreModule.forFeature(feature.key, feature.reducer),
    EffectsModule.forFeature([feature.Effects]),
  ],
})
export class EventsModule {}
