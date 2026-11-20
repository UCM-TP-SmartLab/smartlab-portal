import { NgModule } from "@angular/core";
import { StoreModule } from "@ngrx/store";
import { EffectsModule } from "@ngrx/effects";
import { RouterModule } from "@angular/router";
import { catalogReducer, CatalogEffects } from "./store/catalog.store";
@NgModule({
  imports: [
    StoreModule.forFeature("catalog", catalogReducer),
    EffectsModule.forFeature([CatalogEffects]),
    RouterModule.forChild([
      {
        path: "priestory-a-vybavenie",
        loadChildren: () =>
          import("../resources/resources.module").then(
            (m) => m.ResourcesModule,
          ),
      },
      {
        path: "obsadenost",
        loadChildren: () =>
          import("../availability/availability.module").then(
            (m) => m.AvailabilityModule,
          ),
      },
    ]),
  ],
})
export class CatalogModule {}
