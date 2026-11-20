import { NgModule } from "@angular/core";
import { RouterModule } from "@angular/router";
import { PartnersComponent } from "./view/partners.component";
@NgModule({
  imports: [
    RouterModule.forChild([
      { path: "", component: PartnersComponent },
      { path: ":slug", component: PartnersComponent },
    ]),
  ],
  exports: [RouterModule],
})
export class PartnersRoutingModule {}
