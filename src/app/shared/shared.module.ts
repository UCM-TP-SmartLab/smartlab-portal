import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { StatePanelComponent } from './view/state-panel.component';
import { InstantPipe } from './pipes/instant.pipe';
const modules=[CommonModule,RouterModule,MatButtonModule,MatCardModule,MatProgressSpinnerModule];
@NgModule({imports:modules,declarations:[StatePanelComponent,InstantPipe],exports:[...modules,StatePanelComponent,InstantPipe]})
export class SharedModule {}
