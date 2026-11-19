import { NgModule } from "@angular/core";
import { RouterModule } from "@angular/router";
import { HomeComponent } from "./view/home.component";
import { AboutComponent } from "./view/about.component";
import { ContactComponent } from "./view/contact.component";
import { NotFoundComponent } from "./view/not-found.component";
@NgModule({
  imports: [
    RouterModule.forChild([
      { path: "domov", component: HomeComponent },
      { path: "o-smartlabe", component: AboutComponent },
      { path: "kontakt", component: ContactComponent },
      { path: "404", component: NotFoundComponent },
    ]),
  ],
  exports: [RouterModule],
})
export class PublicRoutingModule {}
