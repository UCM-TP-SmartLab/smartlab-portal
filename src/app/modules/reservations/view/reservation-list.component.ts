import { Component, inject } from "@angular/core";
import { ActivatedRoute } from "@angular/router";
import { MatDialog } from "@angular/material/dialog";
import { Store } from "@ngrx/store";
import { BehaviorSubject, combineLatest, filter, map, of, tap } from "rxjs";
import { SeoService } from "../../../core/seo/seo.service";
import { PermissionPolicyService } from "../../../core/auth/permission-policy.service";
import { STATUS_LABELS } from "../../../data/frontend.models";
import { ConfirmDialogComponent } from "../../../shared/view/confirm-dialog.component";
import { selectSession } from "../../../store/session/session.store";
import * as W from "../../workspace/store/workspace.store";
@Component({
  selector: "sl-reservation-list",
  standalone: false,
  templateUrl: "./reservation-list.component.html",
})
export class ReservationListComponent {
  private readonly store = inject(Store);
  private readonly dialog = inject(MatDialog);
  private readonly policy = inject(PermissionPolicyService);
  private readonly route = inject(ActivatedRoute);
  readonly labels = STATUS_LABELS;
  readonly statuses = Object.entries(STATUS_LABELS);
  readonly resources$ = this.store.select(W.selectWorkspaceResources);
  readonly busy$ = this.store.select(W.selectBusy);
  readonly error$ = this.store.select(W.selectError);
  readonly loadError$ = this.store.select(W.selectLoadError);
  readonly notice$ = this.store.select(W.selectNotice);
  readonly loading$ = this.store.select(W.selectLoading);
  readonly filters$ = new BehaviorSubject({
    status: "",
    resource: "",
    date: "",
  });
  readonly bookings$ = combineLatest([
    this.store.select(W.selectBookings),
    this.store.select(selectSession),
    this.filters$,
  ]).pipe(
    map(([bookings, session, f]) =>
      bookings
        .filter(
          (b) =>
            b.ownerId === session.id &&
            (!f.status || b.status === f.status) &&
            (!f.resource || b.resourceId === f.resource) &&
            (!f.date || b.date === f.date),
        )
        .map((b) => ({ ...b, cancellable: this.policy.canCancel(session, b) })),
    ),
  );
  readonly detailId$ = this.route.paramMap.pipe(map((p) => p.get("id")));
  readonly detail$ = combineLatest([this.bookings$, this.detailId$]).pipe(
    map(([items, id]) => items.find((i) => i.id === id) || null),
  );
  cancel$ = of(false);
  constructor() {
    inject(SeoService).update({
      title: "Moje rezervácie",
      description: "Prehľad vlastných demo rezervácií.",
      path: "/rezervacie",
      private: true,
    });
    this.store.dispatch(W.clearOperation());
    this.store.dispatch(W.loadWorkspace({ scope: "mine" }));
  }
  setFilter(key: "status" | "resource" | "date", value: string): void {
    this.filters$.next({ ...this.filters$.value, [key]: value });
  }
  cancel(id: string): void {
    this.cancel$ = this.dialog
      .open(ConfirmDialogComponent, {
        data: {
          title: "Zrušiť demo rezerváciu?",
          message: "Táto zmena sa týka iba lokálnej demo relácie.",
        },
      })
      .afterClosed()
      .pipe(
        filter((confirmed: boolean) => confirmed === true),
        tap(() => this.store.dispatch(W.cancelBooking({ id }))),
      );
  }
}
