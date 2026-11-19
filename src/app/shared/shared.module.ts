import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { RouterModule } from "@angular/router";
import { ReactiveFormsModule } from "@angular/forms";
import { MatButtonModule } from "@angular/material/button";
import { MatCardModule } from "@angular/material/card";
import { MatFormFieldModule } from "@angular/material/form-field";
import { MatInputModule } from "@angular/material/input";
import { MatSelectModule } from "@angular/material/select";
import { MatProgressSpinnerModule } from "@angular/material/progress-spinner";
import { MatDialogModule } from "@angular/material/dialog";
import { MatTableModule } from "@angular/material/table";
import { StatePanelComponent } from "./view/state-panel.component";
import { ConfirmDialogComponent } from "./view/confirm-dialog.component";
import { InstantPipe } from "./pipes/instant.pipe";
import { ContentViewComponent } from "./content/content-view.component";
const modules = [
  CommonModule,
  RouterModule,
  ReactiveFormsModule,
  MatButtonModule,
  MatCardModule,
  MatFormFieldModule,
  MatInputModule,
  MatSelectModule,
  MatProgressSpinnerModule,
  MatDialogModule,
  MatTableModule,
];
@NgModule({
  imports: modules,
  declarations: [
    StatePanelComponent,
    ConfirmDialogComponent,
    InstantPipe,
    ContentViewComponent,
  ],
  exports: [...modules, StatePanelComponent, InstantPipe, ContentViewComponent],
})
export class SharedModule {}
