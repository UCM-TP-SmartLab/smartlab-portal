import { Component } from "@angular/core";
import { ContentPageBase } from "../../../shared/content/content-page.base";
import { feature } from "../store/partners.store";
@Component({
  selector: "sl-partners",
  standalone: false,
  templateUrl: "./partners.component.html",
})
export class PartnersComponent extends ContentPageBase {
  constructor() {
    super(
      {
        title: "Partneri",
        description: "Spolupráca prepája univerzitu, mesto a prax.",
        path: "/partneri",
        eyebrow: "SPOLOČNE DOKÁŽEME VIAC",
      },
      feature,
    );
  }
}
