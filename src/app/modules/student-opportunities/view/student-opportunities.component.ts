import { Component } from "@angular/core";
import { ContentPageBase } from "../../../shared/content/content-page.base";
import { feature } from "../store/student-opportunities.store";
@Component({
  selector: "sl-student-opportunities",
  standalone: false,
  templateUrl: "./student-opportunities.component.html",
})
export class StudentOpportunitiesComponent extends ContentPageBase {
  constructor() {
    super(
      {
        title: "Príležitosti pre študentov",
        description: "Priestor pre vaše schopnosti, nápady a budúcnosť.",
        path: "/prilezitosti-pre-studentov",
        eyebrow: "PRE ŠTUDENTOV",
      },
      feature,
    );
  }
}
