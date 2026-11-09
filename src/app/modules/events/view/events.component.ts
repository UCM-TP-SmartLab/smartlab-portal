import { Component } from "@angular/core";
import { ContentPageBase } from "../../../shared/content/content-page.base";
import { feature } from "../store/events.store";
@Component({
  selector: "sl-events",
  standalone: false,
  templateUrl: "./events.component.html",
})
export class EventsComponent extends ContentPageBase {
  constructor() {
    super(
      {
        title: "Podujatia",
        description: "Stretnutia, workshopy a nové príležitosti učiť sa spolu.",
        path: "/podujatia",
        eyebrow: "STRETNIME SA",
      },
      feature,
    );
  }
}
