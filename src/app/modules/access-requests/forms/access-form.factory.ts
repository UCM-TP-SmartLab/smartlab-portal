import { Injectable } from "@angular/core";
import { FormControl, FormGroup, Validators } from "@angular/forms";
@Injectable({ providedIn: "root" })
export class AccessFormFactory {
  create(): FormGroup {
    return new FormGroup({
      purpose: new FormControl("", [
        Validators.required,
        Validators.pattern(/\S/),
        Validators.maxLength(1000),
      ]),
    });
  }
}
