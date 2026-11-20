import { Component, Input } from "@angular/core";
import type { ContentPageBase } from "./content-page.base";
@Component({
  selector: "sl-content-view",
  standalone: false,
  templateUrl: "./content-view.component.html",
})
export class ContentViewComponent {
  @Input({ required: true }) view!: ContentPageBase;
}
