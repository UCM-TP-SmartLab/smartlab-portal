import { NgModule } from "@angular/core";
import { RouterModule } from "@angular/router";
import { ResourcesComponent } from "./view/resources.component";
@NgModule({
  imports: [
    RouterModule.forChild([
      { path: "", component: ResourcesComponent },
      { path: ":id", component: ResourcesComponent },
    ]),
  ],
  exports: [RouterModule],
})
export class ResourcesRoutingModule {}
