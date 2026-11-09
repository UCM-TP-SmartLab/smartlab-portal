import { Component, inject } from "@angular/core";
import { MAT_DIALOG_DATA } from "@angular/material/dialog";
@Component({
  selector: "sl-confirm-dialog",
  standalone: false,
  templateUrl: "./confirm-dialog.component.html",
})
export class ConfirmDialogComponent {
  readonly data = inject<{ title: string; message: string }>(MAT_DIALOG_DATA);
}
