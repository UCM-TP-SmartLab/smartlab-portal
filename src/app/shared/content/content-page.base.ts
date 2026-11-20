import { Directive, inject } from "@angular/core";
import { ActivatedRoute } from "@angular/router";
import { Store } from "@ngrx/store";
import { BehaviorSubject, combineLatest, map } from "rxjs";
import { PORTAL_CONFIG } from "../../config/portal.config";
import { SeoService } from "../../core/seo/seo.service";
import { FrontendContentEntry } from "../../data/frontend.models";
import {
  buildMonthDays,
  isPublishableOpportunity,
  isUpcomingEvent,
  normalizeHttpsUrl,
} from "../utils/content";
import { createContentFeature } from "./content-feature";
import {
  bratislavaCalendarDate,
  bratislavaToday,
} from "../utils/bratislava-time";
interface ContentFilter {
  category: string;
  date: string;
  form: string;
  audience: string;
  partner: string;
}
export interface ContentPageConfig {
  title: string;
  description: string;
  path: string;
  eyebrow: string;
}
@Directive()
export abstract class ContentPageBase {
  readonly view = this;
  readonly config = inject(PORTAL_CONFIG);
  protected readonly store = inject(Store);
  private readonly route = inject(ActivatedRoute);
  private readonly seo = inject(SeoService);
  readonly filter$ = new BehaviorSubject<ContentFilter>({
    category: "",
    date: "",
    form: "",
    audience: "",
    partner: "",
  });
  readonly entries$;
  readonly loading$;
  readonly error$;
  readonly detail$;
  readonly isDetail$;
  readonly categories$;
  readonly forms$;
  readonly audiences$;
  readonly partners$;
  readonly isEvents: boolean;
  month = Number(bratislavaToday().slice(5, 7)) - 1;
  year = Number(bratislavaToday().slice(0, 4));
  monthLabel = "";
  days: readonly {
    date: string | null;
    label: string;
    events: readonly FrontendContentEntry[];
  }[] = [];
  readonly calendar$;
  protected constructor(
    readonly page: ContentPageConfig,
    private readonly feature: ReturnType<typeof createContentFeature>,
  ) {
    this.isEvents = feature.kind === "events";
    const source$ = this.store.select(feature.entries).pipe(
      map((entries) =>
        entries
          .filter(
            (e) =>
              feature.kind !== "opportunities" ||
              isPublishableOpportunity(e.title),
          )
          .map((entry) => ({
            ...entry,
            safeUrl: normalizeHttpsUrl(entry.url || ""),
            registrationOpen: isUpcomingEvent(
              entry.date,
              entry.end,
              new Date(),
            ),
          })),
      ),
    );
    this.loading$ = this.store.select(feature.loading);
    this.error$ = this.store.select(feature.error);
    this.isDetail$ = this.route.paramMap.pipe(map((p) => p.has("slug")));
    this.detail$ = combineLatest([source$, this.route.paramMap]).pipe(
      map(([entries, params]) => {
        const entry =
          entries.find((e) => e.slug === params.get("slug")) || null;
        this.seo.update({
          title: params.has("slug")
            ? entry?.title || "Záznam sa nenašiel"
            : page.title,
          description: entry?.summary || page.description,
          path: entry ? `${page.path}/${entry.slug}` : page.path,
        });
        return entry;
      }),
    );
    this.entries$ = combineLatest([source$, this.filter$]).pipe(
      map(([entries, filter]) =>
        entries.filter(
          (e) =>
            (!filter.category || e.category === filter.category) &&
            (!filter.date ||
              (!!e.date && bratislavaCalendarDate(e.date) === filter.date)) &&
            (!filter.form || e.form === filter.form) &&
            (!filter.audience || e.audience === filter.audience) &&
            (!filter.partner || e.partner === filter.partner),
        ),
      ),
    );
    this.categories$ = source$.pipe(
      map((entries) => [
        ...new Set(entries.map((e) => e.category).filter(Boolean)),
      ]),
    );
    this.forms$ = source$.pipe(
      map((entries) => [
        ...new Set(entries.map((e) => e.form).filter(Boolean)),
      ]),
    );
    this.audiences$ = source$.pipe(
      map((entries) => [
        ...new Set(entries.map((e) => e.audience).filter(Boolean)),
      ]),
    );
    this.partners$ = source$.pipe(
      map((entries) => [
        ...new Set(entries.map((e) => e.partner).filter(Boolean)),
      ]),
    );
    this.calendar$ = combineLatest([this.entries$, this.monthChanges$]).pipe(
      map(([entries]) => {
        this.monthLabel = new Intl.DateTimeFormat("sk-SK", {
          month: "long",
          year: "numeric",
          timeZone: "UTC",
        }).format(new Date(Date.UTC(this.year, this.month, 1)));
        this.days = buildMonthDays(this.year, this.month).map((day) => ({
          ...day,
          events: entries.filter(
            (e) => e.date && bratislavaCalendarDate(e.date) === day.date,
          ),
        }));
        return true;
      }),
    );
    this.store.dispatch(feature.load());
  }
  private readonly monthChanges$ = new BehaviorSubject(0);
  filter(key: keyof ContentFilter, value: string): void {
    this.filter$.next({ ...this.filter$.value, [key]: value });
  }
  changeMonth(delta: number): void {
    const date = new Date(Date.UTC(this.year, this.month + delta, 1));
    this.year = date.getUTCFullYear();
    this.month = date.getUTCMonth();
    this.monthChanges$.next(delta);
  }
  reload(): void {
    this.store.dispatch(this.feature.load());
  }
}
