import { NgModule } from "@angular/core";
import { StoreModule } from "@ngrx/store";
import { EffectsModule } from "@ngrx/effects";
import { SharedModule } from "../../shared/shared.module";
import { ProjectsComponent } from "./view/projects.component";
import { ProjectsRoutingModule } from "./projects-routing.module";
import { feature } from "./store/projects.store";
@NgModule({
  declarations: [ProjectsComponent],
  imports: [
    SharedModule,
    ProjectsRoutingModule,
    StoreModule.forFeature(feature.key, feature.reducer),
    EffectsModule.forFeature([feature.Effects]),
  ],
})
export class ProjectsModule {}
