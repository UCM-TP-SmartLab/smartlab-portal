import { Component, inject } from "@angular/core";
import { SeoService } from "../../../core/seo/seo.service";
@Component({
  selector: "sl-not-found",
  standalone: false,
  templateUrl: "./not-found.component.html",
})
export class NotFoundComponent {
  constructor() {
    inject(SeoService).update({
      title: "Stránka sa nenašla",
      description: "Požadovanú stránku sa nepodarilo nájsť.",
      path: "/404",
      private: true,
    });
  }
}
