import { NgModule } from "@angular/core";
import { RouterModule } from "@angular/router";
import { NewsComponent } from "./view/news.component";
@NgModule({
  imports: [
    RouterModule.forChild([
      { path: "", component: NewsComponent },
      { path: ":slug", component: NewsComponent },
    ]),
  ],
  exports: [RouterModule],
})
export class NewsRoutingModule {}
