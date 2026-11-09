import { Component, inject } from "@angular/core";
import { ActivatedRoute } from "@angular/router";
import { Store } from "@ngrx/store";
import { MatDialog } from "@angular/material/dialog";
import { ErrorStateMatcher } from "@angular/material/core";
import { FormControl } from "@angular/forms";
import { BehaviorSubject, combineLatest, filter, map, of, tap } from "rxjs";
import { SeoService } from "../../../core/seo/seo.service";
import {
  FrontendDecision,
  FrontendQueueItem,
  STATUS_LABELS,
  UiRequestStatus,
  UiRole,
  ROLE_LABELS,
} from "../../../data/frontend.models";
import { ConfirmDialogComponent } from "../../../shared/view/confirm-dialog.component";
import { selectRole } from "../../../store/session/session.store";
import { DecisionFormFactory } from "../forms/decision-form.factory";
import * as W from "../../workspace/store/workspace.store";
class ReasonErrorMatcher implements ErrorStateMatcher {
  isErrorState(control: FormControl | null): boolean {
    return (
      !!control &&
      control.touched &&
      (control.invalid || !!control.parent?.hasError("reasonRequired"))
    );
  }
}
@Component({
  selector: "sl-management",
  standalone: false,
  templateUrl: "./management.component.html",
})
export class ManagementComponent {
  private readonly store = inject(Store);
  private readonly route = inject(ActivatedRoute);
  private readonly dialog = inject(MatDialog);
  readonly labels = STATUS_LABELS;
  readonly statuses = Object.entries(STATUS_LABELS);
  readonly approved = UiRequestStatus.Approved;
  readonly rejected = UiRequestStatus.Rejected;
  readonly pending = UiRequestStatus.Pending;
  readonly page$ = this.route.data.pipe(
    map((data) => (data["page"] as string) || "queue"),
  );
  readonly pageTitle$ = this.page$.pipe(
    map(
      (page) =>
        ({
          resources: "Správa zdrojov",
          roles: "Používateľské roly",
          queue: "Fronta žiadostí",
        })[page as "resources" | "roles" | "queue"],
    ),
  );
  readonly role$ = this.store.select(selectRole);
  readonly admin = UiRole.Admin;
  readonly roleLabels = ROLE_LABELS;
  readonly demoRoles = [
    { name: "Demo študent", role: UiRole.Student },
    { name: "Demo správca", role: UiRole.Manager },
    { name: "Demo administrátor", role: UiRole.Admin },
  ];
  readonly resources$ = this.store.select(W.selectWorkspaceResources);
  readonly busy$ = this.store.select(W.selectBusy);
  readonly loading$ = this.store.select(W.selectLoading);
  readonly error$ = this.store.select(W.selectError);
  readonly loadError$ = this.store.select(W.selectLoadError);
  readonly notice$ = this.store.select(W.selectNotice);
  readonly formGroup = inject(DecisionFormFactory).create();
  readonly matcher = new ReasonErrorMatcher();
  readonly filters$ = new BehaviorSubject({
    status: UiRequestStatus.Pending as string,
    date: "",
    resource: "",
  });
  readonly queue$ = combineLatest([
    this.store.select(W.selectBookings),
    this.store.select(W.selectAccess),
    this.filters$,
  ]).pipe(
    map(([bookings, access, f]) => {
      const items: FrontendQueueItem[] = [
        ...bookings.map((item) => ({ kind: "reservation" as const, item })),
        ...access.map((item) => ({ kind: "access" as const, item })),
      ];
      return items.filter(
        (q) =>
          (!f.status || q.item.status === f.status) &&
          (!f.resource ||
            (q.kind === "reservation" && q.item.resourceId === f.resource)) &&
          (!f.date || (q.kind === "reservation" && q.item.date === f.date)),
      );
    }),
  );
  readonly selected$ = combineLatest([
    this.store.select(W.selectBookings),
    this.store.select(W.selectAccess),
    this.route.paramMap,
  ]).pipe(
    map(([bookings, access, params]): FrontendQueueItem | null => {
      const id = params.get("id");
      if (!id) return null;
      if (params.get("kind") === "reservation") {
        const item = bookings.find((b) => b.id === id);
        return item ? { kind: "reservation", item } : null;
      }
      if (params.get("kind") === "access") {
        const item = access.find((a) => a.id === id);
        return item ? { kind: "access", item } : null;
      }
      return null;
    }),
  );
  readonly detailMode$ = this.route.paramMap.pipe(map((p) => p.has("id")));
  decision$ = of(false);
  constructor() {
    inject(SeoService).update({
      title: "Administrácia",
      description: "Lokálna demo správa rezervácií a prístupových žiadostí.",
      path: "/administracia",
      private: true,
    });
    this.store.dispatch(W.clearOperation());
    this.store.dispatch(W.loadWorkspace({ scope: "management" }));
  }
  setFilter(key: "status" | "resource" | "date", value: string): void {
    this.filters$.next({ ...this.filters$.value, [key]: value });
  }
  decide(item: FrontendQueueItem): void {
    this.formGroup.markAllAsTouched();
    if (!this.formGroup.valid) return;
    const decision: FrontendDecision = {
      kind: item.kind,
      id: item.item.id,
      ...this.formGroup.getRawValue(),
    };
    this.decision$ = this.dialog
      .open(ConfirmDialogComponent, {
        data: {
          title: "Potvrdiť demo rozhodnutie?",
          message: "Rozhodnutie sa uloží iba v tejto lokálnej relácii.",
        },
      })
      .afterClosed()
      .pipe(
        filter((confirmed: boolean) => confirmed === true),
        tap(() => this.store.dispatch(W.makeDecision({ decision }))),
      );
  }
}
