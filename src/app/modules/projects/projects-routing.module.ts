import { NgModule } from "@angular/core";
import { RouterModule } from "@angular/router";
import { ProjectsComponent } from "./view/projects.component";
@NgModule({
  imports: [
    RouterModule.forChild([
      { path: "", component: ProjectsComponent },
      { path: ":slug", component: ProjectsComponent },
    ]),
  ],
  exports: [RouterModule],
})
export class ProjectsRoutingModule {}
