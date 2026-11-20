import { NgModule } from "@angular/core";
import { SharedModule } from "../../shared/shared.module";
import { ResourcesComponent } from "./view/resources.component";
import { ResourcesRoutingModule } from "./resources-routing.module";
@NgModule({
  declarations: [ResourcesComponent],
  imports: [SharedModule, ResourcesRoutingModule],
})
export class ResourcesModule {}
