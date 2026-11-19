import { Injectable } from "@angular/core";
import { FormControl, FormGroup, Validators } from "@angular/forms";
import { UiRequestStatus } from "../../../data/frontend.models";
@Injectable({ providedIn: "root" })
export class DecisionFormFactory {
  create(): FormGroup {
    return new FormGroup(
      {
        status: new FormControl(UiRequestStatus.Approved, Validators.required),
        reason: new FormControl("", Validators.maxLength(1000)),
      },
      {
        validators: (group) =>
          group.value.status === UiRequestStatus.Rejected &&
          !group.value.reason?.trim()
            ? { reasonRequired: true }
            : null,
      },
    );
  }
}
