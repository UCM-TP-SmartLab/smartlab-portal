import { NgModule } from "@angular/core";
import { StoreModule } from "@ngrx/store";
import { EffectsModule } from "@ngrx/effects";
import { SharedModule } from "../../shared/shared.module";
import { NewsComponent } from "./view/news.component";
import { NewsRoutingModule } from "./news-routing.module";
import { feature } from "./store/news.store";
@NgModule({
  declarations: [NewsComponent],
  imports: [
    SharedModule,
    NewsRoutingModule,
    StoreModule.forFeature(feature.key, feature.reducer),
    EffectsModule.forFeature([feature.Effects]),
  ],
})
export class NewsModule {}
