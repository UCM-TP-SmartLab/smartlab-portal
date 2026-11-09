import { Injectable } from "@angular/core";
import {
  AbstractControl,
  FormControl,
  FormGroup,
  Validators,
} from "@angular/forms";
import { ErrorStateMatcher } from "@angular/material/core";
import {
  bratislavaToday,
  validateInterval,
} from "../../../shared/utils/bratislava-time";
export const intervalMessages: Record<string, string> = {
  quantity: "Zadajte kladný celý počet kusov.",
  interval: "Koniec musí byť neskôr ako začiatok.",
  nonexistent:
    "Táto hodina pri prechode na letný čas neexistuje. Vyberte iný čas.",
  ambiguous:
    "Táto hodina pri prechode na zimný čas nastáva dvakrát. Vyberte jednoznačný čas.",
  invalid: "Zadajte platný dátum a čas.",
};
@Injectable({ providedIn: "root" })
export class ReservationFormFactory {
  create(resourceId = ""): FormGroup {
    return new FormGroup(
      {
        resourceId: new FormControl(resourceId, {
          nonNullable: true,
          validators: [Validators.required],
        }),
        date: new FormControl(bratislavaToday(), [Validators.required]),
        start: new FormControl("09:00", [Validators.required]),
        end: new FormControl("10:00", [Validators.required]),
        quantity: new FormControl(1, [
          Validators.required,
          Validators.min(1),
          Validators.pattern(/^[1-9]\d*$/),
        ]),
        purpose: new FormControl("", [
          Validators.required,
          Validators.pattern(/\S/),
          Validators.maxLength(1000),
        ]),
      },
      {
        validators: (control: AbstractControl) => {
          const v = control.value;
          const error = validateInterval(
            v.date,
            v.start,
            v.end,
            Number(v.quantity),
          );
          return error ? { interval: error } : null;
        },
      },
    );
  }
}
export class IntervalErrorMatcher implements ErrorStateMatcher {
  isErrorState(control: FormControl | null): boolean {
    return (
      !!control &&
      (control.touched || control.dirty) &&
      (control.invalid || !!control.parent?.hasError("interval"))
    );
  }
}
