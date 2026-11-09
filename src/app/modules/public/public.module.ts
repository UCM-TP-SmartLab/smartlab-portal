import { NgModule } from "@angular/core";
import { StoreModule } from "@ngrx/store";
import { EffectsModule } from "@ngrx/effects";
import { SharedModule } from "../../shared/shared.module";
import { PublicRoutingModule } from "./public-routing.module";
import { HomeComponent } from "./view/home.component";
import { NotFoundComponent } from "./view/not-found.component";
import { homeFeature } from "./store/home.store";
@NgModule({
  declarations: [
    HomeComponent,
    NotFoundComponent,
  ],
  imports: [
    SharedModule,
    PublicRoutingModule,
    StoreModule.forFeature(homeFeature.key, homeFeature.reducer),
    EffectsModule.forFeature([homeFeature.Effects]),
  ],
})
export class PublicModule {}
