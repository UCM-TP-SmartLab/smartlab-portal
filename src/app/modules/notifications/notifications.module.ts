import { NgModule } from "@angular/core";
import { EffectsModule } from "@ngrx/effects";
import { StoreModule } from "@ngrx/store";
import { SharedModule } from "../../shared/shared.module";
import { NotificationsComponent } from "./view/notifications.component";
import { NotificationEffects } from "./store/notifications.effects";
import { notificationReducer } from "./store/notifications.store";

@NgModule({
  declarations: [NotificationsComponent],
  imports: [
    SharedModule,
    StoreModule.forFeature("notifications", notificationReducer),
    EffectsModule.forFeature([NotificationEffects]),
  ],
  exports: [NotificationsComponent],
})
export class NotificationsModule {}
