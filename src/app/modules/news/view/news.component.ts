import { Component } from "@angular/core";
import { ContentPageBase } from "../../../shared/content/content-page.base";
import { feature } from "../store/news.store";
@Component({
  selector: "sl-news",
  standalone: false,
  templateUrl: "./news.component.html",
})
export class NewsComponent extends ContentPageBase {
  constructor() {
    super(
      {
        title: "Aktuality",
        description: "Čo je nové v SmartLabe.",
        path: "/aktuality",
        eyebrow: "ZO ŽIVOTA SMARTLABU",
      },
      feature,
    );
  }
}
