import { NgModule } from "@angular/core";
import { SharedModule } from "../../shared/shared.module";
import { ManagementComponent } from "./view/management.component";
import { ManagementRoutingModule } from "./management-routing.module";
import { StoreModule } from "@ngrx/store";
import { EffectsModule } from "@ngrx/effects";
import { adminReducer } from "./store/admin.store";
import { AdminEffects } from "./store/admin.effects";
import { AdminPanelComponent } from "./view/admin-panel.component";
@NgModule({
  declarations: [ManagementComponent, AdminPanelComponent],
  imports: [
    SharedModule,
    ManagementRoutingModule,
    StoreModule.forFeature("admin", adminReducer),
    EffectsModule.forFeature([AdminEffects]),
  ],
})
export class ManagementModule {}
