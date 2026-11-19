import { NgModule } from "@angular/core";
import { StoreModule } from "@ngrx/store";
import { EffectsModule } from "@ngrx/effects";
import { SharedModule } from "../../shared/shared.module";
import { PartnersComponent } from "./view/partners.component";
import { PartnersRoutingModule } from "./partners-routing.module";
import { feature } from "./store/partners.store";
@NgModule({
  declarations: [PartnersComponent],
  imports: [
    SharedModule,
    PartnersRoutingModule,
    StoreModule.forFeature(feature.key, feature.reducer),
    EffectsModule.forFeature([feature.Effects]),
  ],
})
export class PartnersModule {}
