import { Component, inject } from "@angular/core";
import { ActivatedRoute } from "@angular/router";
import { Store } from "@ngrx/store";
import { map, startWith } from "rxjs";
import { SeoService } from "../../../core/seo/seo.service";
import { FrontendReservationDraft } from "../../../data/frontend.models";
import {
  ReservationFormFactory,
  IntervalErrorMatcher,
  intervalMessages,
} from "../forms/reservation-form.factory";
import * as W from "../../workspace/store/workspace.store";
@Component({
  selector: "sl-create-reservation",
  standalone: false,
  templateUrl: "./create-reservation.component.html",
})
export class CreateReservationComponent {
  private readonly store = inject(Store);
  private readonly params = inject(ActivatedRoute).snapshot.queryParamMap;
  readonly formGroup = inject(ReservationFormFactory).create(
    this.params.get("resource") || "",
  );
  readonly matcher = new IntervalErrorMatcher();
  readonly resources$ = this.store.select(W.selectWorkspaceResources);
  readonly busy$ = this.store.select(W.selectBusy);
  readonly error$ = this.store.select(W.selectError);
  readonly notice$ = this.store.select(W.selectNotice);
  readonly createdId$ = this.store.select(W.selectCreatedId);
  summary: FrontendReservationDraft | null = null;
  readonly changes$ = this.formGroup.valueChanges.pipe(
    startWith(this.formGroup.value),
    map((value) => {
      this.summary = null;
      const key = this.formGroup.getError("interval") as string | undefined;
      return { value, intervalError: key ? intervalMessages[key] : null };
    }),
  );
  constructor() {
    inject(SeoService).update({
      title: "Nová rezervácia",
      description: "Vytvorenie demo rezervácie.",
      path: "/rezervacie/nova",
      private: true,
    });
    if (this.params.get("date"))
      this.formGroup.patchValue({ date: this.params.get("date") });
    this.store.dispatch(W.clearOperation());
    this.store.dispatch(W.loadWorkspace({ scope: "mine" }));
  }
  review(): void {
    this.formGroup.markAllAsTouched();
    if (this.formGroup.valid)
      this.summary = {
        ...this.formGroup.getRawValue(),
        quantity: Number(this.formGroup.value.quantity),
      } as FrontendReservationDraft;
  }
  submit(): void {
    if (this.formGroup.valid && this.summary)
      this.store.dispatch(W.createBooking({ draft: this.summary }));
  }
}
