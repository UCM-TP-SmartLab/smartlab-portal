import { Component, inject } from "@angular/core";
import { SeoService } from "../../../core/seo/seo.service";
@Component({
  selector: "sl-contact",
  standalone: false,
  templateUrl: "./contact.component.html",
})
export class ContactComponent {
  constructor() {
    inject(SeoService).update({
      title: "Kontakt",
      description: "SmartLab UCM & Trnava nájdete na Hlavnej 5 v Trnave.",
      path: "/kontakt",
    });
  }
}
