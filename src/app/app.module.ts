import { NgModule } from "@angular/core";
import { BrowserModule } from "@angular/platform-browser";
import { NoopAnimationsModule } from "@angular/platform-browser/animations";
import { StoreModule } from "@ngrx/store";
import { EffectsModule } from "@ngrx/effects";
import { AppComponent } from "./app.component";
import { AppRoutingModule } from "./app-routing.module";
import { CoreModule } from "./core/core.module";
import { SharedModule } from "./shared/shared.module";
import { sessionReducer } from "./store/session/session.store";
import { SessionEffects } from "./store/session/session.effects";
import { NotificationsModule } from "./modules/notifications/notifications.module";
@NgModule({
  declarations: [AppComponent],
  imports: [
    BrowserModule,
    NoopAnimationsModule,
    CoreModule,
    SharedModule,
    StoreModule.forRoot({ session: sessionReducer }),
    EffectsModule.forRoot([SessionEffects]),
    NotificationsModule,
    AppRoutingModule,
  ],
  bootstrap: [AppComponent],
})
export class AppModule {}
