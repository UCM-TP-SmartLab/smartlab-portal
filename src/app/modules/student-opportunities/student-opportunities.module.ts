import { NgModule } from "@angular/core";
import { StoreModule } from "@ngrx/store";
import { EffectsModule } from "@ngrx/effects";
import { SharedModule } from "../../shared/shared.module";
import { StudentOpportunitiesComponent } from "./view/student-opportunities.component";
import { StudentOpportunitiesRoutingModule } from "./student-opportunities-routing.module";
import { feature } from "./store/student-opportunities.store";
@NgModule({
  declarations: [StudentOpportunitiesComponent],
  imports: [
    SharedModule,
    StudentOpportunitiesRoutingModule,
    StoreModule.forFeature(feature.key, feature.reducer),
    EffectsModule.forFeature([feature.Effects]),
  ],
})
export class StudentOpportunitiesModule {}
