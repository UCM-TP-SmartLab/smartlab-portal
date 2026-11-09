import { NgModule } from "@angular/core";
import { RouterModule } from "@angular/router";
import { StudentOpportunitiesComponent } from "./view/student-opportunities.component";
@NgModule({
  imports: [
    RouterModule.forChild([
      { path: "", component: StudentOpportunitiesComponent },
      { path: ":slug", component: StudentOpportunitiesComponent },
    ]),
  ],
  exports: [RouterModule],
})
export class StudentOpportunitiesRoutingModule {}
