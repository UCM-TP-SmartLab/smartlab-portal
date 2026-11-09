import { Component, Input } from "@angular/core";
@Component({
  selector: "sl-state",
  standalone: false,
  templateUrl: "./state-panel.component.html",
})
export class StatePanelComponent {
  @Input() title = "Zatiaľ tu nie sú žiadne záznamy";
  @Input() message = "";
  @Input() error = false;
}
