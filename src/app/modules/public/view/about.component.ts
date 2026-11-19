import { Component, inject } from "@angular/core";
import { SeoService } from "../../../core/seo/seo.service";
@Component({
  selector: "sl-about",
  standalone: false,
  templateUrl: "./about.component.html",
})
export class AboutComponent {
  constructor() {
    inject(SeoService).update({
      title: "O SmartLabe",
      description: "Poslanie a priestor pre spoluprácu SmartLab UCM & Trnava.",
      path: "/o-smartlabe",
    });
  }
}
