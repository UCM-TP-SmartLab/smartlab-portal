import { Component, inject } from "@angular/core";
import { Store } from "@ngrx/store";
import { combineLatest, map } from "rxjs";
import { SeoService } from "../../../core/seo/seo.service";
import { STATUS_LABELS } from "../../../data/frontend.models";
import { selectSession } from "../../../store/session/session.store";
import { AccessFormFactory } from "../forms/access-form.factory";
import * as W from "../../workspace/store/workspace.store";
@Component({
  selector: "sl-access-requests",
  standalone: false,
  templateUrl: "./access-requests.component.html",
})
export class AccessRequestsComponent {
  private readonly store = inject(Store);
  readonly formGroup = inject(AccessFormFactory).create();
  readonly labels = STATUS_LABELS;
  readonly busy$ = this.store.select(W.selectBusy);
  readonly error$ = this.store.select(W.selectError);
  readonly loadError$ = this.store.select(W.selectLoadError);
  readonly notice$ = this.store.select(W.selectNotice);
  readonly createdId$ = this.store.select(W.selectCreatedId);
  readonly access$ = combineLatest([
    this.store.select(W.selectAccess),
    this.store.select(selectSession),
  ]).pipe(
    map(([items, session]) => items.filter((a) => a.ownerId === session.id)),
  );
  constructor() {
    inject(SeoService).update({
      title: "Žiadosti o prístup",
      description: "Žiadosť o prístup do laboratória v lokálnom deme.",
      path: "/ziadosti-o-pristup",
      private: true,
    });
    this.store.dispatch(W.clearOperation());
    this.store.dispatch(W.loadWorkspace({ scope: "mine" }));
  }
  submit(): void {
    this.formGroup.markAllAsTouched();
    if (this.formGroup.valid)
      this.store.dispatch(
        W.createAccess({ draft: this.formGroup.getRawValue() }),
      );
  }
}
