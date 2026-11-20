import { Component } from "@angular/core";
import { ContentPageBase } from "../../../shared/content/content-page.base";
import { feature } from "../store/projects.store";
@Component({
  selector: "sl-projects",
  standalone: false,
  templateUrl: "./projects.component.html",
})
export class ProjectsComponent extends ContentPageBase {
  constructor() {
    super(
      {
        title: "Projekty",
        description: "Nápady premieňame na spoluprácu a konkrétne riešenia.",
        path: "/projekty",
        eyebrow: "OD NÁPADU K RIEŠENIU",
      },
      feature,
    );
  }
}
