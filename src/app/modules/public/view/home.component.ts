import { Component, inject } from "@angular/core";
import { Store } from "@ngrx/store";
import { map } from "rxjs";
import { PORTAL_CONFIG } from "../../../config/portal.config";
import { SeoService } from "../../../core/seo/seo.service";
import { isUpcomingEvent } from "../../../shared/utils/content";
import { homeFeature } from "../store/home.store";
@Component({
  selector: "sl-home",
  standalone: false,
  templateUrl: "./home.component.html",
})
export class HomeComponent {
  private readonly store = inject(Store);
  readonly config = inject(PORTAL_CONFIG);
  readonly upcoming$ = this.store
    .select(homeFeature.entries)
    .pipe(
      map((events) =>
        events
          .filter((e) => isUpcomingEvent(e.date, e.end, new Date()))
          .slice(0, 3),
      ),
    );
  readonly loading$ = this.store.select(homeFeature.loading);
  readonly error$ = this.store.select(homeFeature.error);
  readonly pillars = [
    {
      number: "01",
      title: "Inovácie",
      text: "Od odvážnej myšlienky k riešeniu, ktoré má zmysel.",
    },
    {
      number: "02",
      title: "Spolupráca",
      text: "Prepájame ľudí, skúsenosti a pohľady na spoločné výzvy.",
    },
    {
      number: "03",
      title: "Vzdelávanie",
      text: "Učíme sa skúšaním, tvorbou a zdieľaním poznatkov.",
    },
    {
      number: "04",
      title: "Digitálna transformácia",
      text: "Objavujeme možnosti technológií pre každodenný život.",
    },
  ];
  constructor() {
    inject(SeoService).update({
      title: "Domov",
      description:
        "SmartLab UCM & Trnava – priestor pre inovácie, spoluprácu a vzdelávanie.",
      path: "/domov",
    });
    this.store.dispatch(homeFeature.load());
  }
}
