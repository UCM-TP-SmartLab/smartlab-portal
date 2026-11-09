import { Component, inject } from "@angular/core";
import { ActivatedRoute } from "@angular/router";
import { Store } from "@ngrx/store";
import { map } from "rxjs";
import { PORTAL_CONFIG } from "../../../config/portal.config";
import { SeoService } from "../../../core/seo/seo.service";
import { STATUS_LABELS } from "../../../data/frontend.models";
import { bratislavaToday } from "../../../shared/utils/bratislava-time";
import {
  loadAvailability,
  loadResources,
  selectAvailabilityError,
  selectAvailabilityKnown,
  selectAvailabilityLoading,
  selectIntervals,
  selectResources,
} from "../../catalog/store/catalog.store";
@Component({
  selector: "sl-availability",
  standalone: false,
  templateUrl: "./availability.component.html",
})
export class AvailabilityComponent {
  readonly config = inject(PORTAL_CONFIG);
  private readonly store = inject(Store);
  readonly resources$ = this.store.select(selectResources);
  readonly intervals$ = this.store.select(selectIntervals);
  readonly known$ = this.store.select(selectAvailabilityKnown);
  readonly loading$ = this.store.select(selectAvailabilityLoading);
  readonly error$ = this.store.select(selectAvailabilityError);
  readonly labels = STATUS_LABELS;
  resourceId =
    inject(ActivatedRoute).snapshot.queryParamMap.get("resource") || "";
  date = bratislavaToday();
  readonly routeChanges$ = inject(ActivatedRoute).queryParamMap.pipe(
    map((p) => {
      const resource = p.get("resource") || "";
      if (resource !== this.resourceId) {
        this.resourceId = resource;
        this.load();
      }
    }),
  );
  constructor() {
    inject(SeoService).update({
      title: "Obsadenosť",
      description: "Verejný prehľad obsadenosti zdrojov bez osobných údajov.",
      path: "/obsadenost",
    });
    this.store.dispatch(loadResources());
    this.load();
  }
  load(): void {
    this.store.dispatch(
      loadAvailability({ resourceId: this.resourceId, date: this.date }),
    );
  }
  changeDate(value: string): void {
    this.date = value;
    this.load();
  }
  changeResource(value: string): void {
    this.resourceId = value;
    this.load();
  }
  navigateDate(delta: number): void {
    const date = new Date(`${this.date}T12:00:00Z`);
    if (!Number.isFinite(date.getTime())) return;
    date.setUTCDate(date.getUTCDate() + delta);
    this.date = date.toISOString().slice(0, 10);
    this.load();
  }
}
