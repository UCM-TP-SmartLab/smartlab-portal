import { Component, inject } from "@angular/core";
import { ActivatedRoute } from "@angular/router";
import { Store } from "@ngrx/store";
import {
  BehaviorSubject,
  combineLatest,
  map,
  filter,
  distinctUntilChanged,
  tap,
} from "rxjs";
import { PORTAL_CONFIG } from "../../../config/portal.config";
import { SeoService } from "../../../core/seo/seo.service";
import {
  loadResources,
  selectResources,
  selectResourcesError,
  selectResourcesLoading,
  loadAvailability,
  selectIntervals,
  selectAvailabilityError,
  selectAvailabilityKnown,
} from "../../catalog/store/catalog.store";
import { bratislavaToday } from "../../../shared/utils/bratislava-time";
import { STATUS_LABELS } from "../../../data/frontend.models";
@Component({
  selector: "sl-resources",
  standalone: false,
  templateUrl: "./resources.component.html",
})
export class ResourcesComponent {
  readonly config = inject(PORTAL_CONFIG);
  private readonly store = inject(Store);
  private readonly route = inject(ActivatedRoute);
  private readonly seo = inject(SeoService);
  readonly filter$ = new BehaviorSubject("");
  readonly loading$ = this.store.select(selectResourcesLoading);
  readonly error$ = this.store.select(selectResourcesError);
  readonly resources$ = combineLatest([
    this.store.select(selectResources),
    this.filter$,
  ]).pipe(
    map(([resources, type]) =>
      resources.filter((r) => !type || r.type === type),
    ),
  );
  readonly isDetail$ = this.route.paramMap.pipe(map((p) => p.has("id")));
  readonly detail$ = combineLatest([
    this.store.select(selectResources),
    this.route.paramMap,
  ]).pipe(
    map(([resources, params]) => {
      const resource = resources.find((r) => r.id === params.get("id")) || null;
      this.seo.update({
        title: params.has("id")
          ? resource?.name || "Zdroj sa nenašiel"
          : "Priestory a vybavenie",
        description:
          resource?.description || "Objavte priestory a vybavenie SmartLabu.",
        path: resource
          ? `/priestory-a-vybavenie/${resource.id}`
          : "/priestory-a-vybavenie",
      });
      return resource;
    }),
  );
  readonly today = bratislavaToday();
  readonly intervals$ = this.store.select(selectIntervals);
  readonly availabilityError$ = this.store.select(selectAvailabilityError);
  readonly availabilityKnown$ = this.store.select(selectAvailabilityKnown);
  readonly labels = STATUS_LABELS;
  readonly detailAvailability$ = this.detail$.pipe(
    filter((resource) => !!resource),
    map((resource) => resource.id),
    distinctUntilChanged(),
    tap((resourceId) =>
      this.store.dispatch(loadAvailability({ resourceId, date: this.today })),
    ),
  );
  constructor() {
    this.store.dispatch(loadResources());
  }
  reload(): void {
    this.store.dispatch(loadResources());
  }
}
