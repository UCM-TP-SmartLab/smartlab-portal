import { Component, Input, inject } from "@angular/core";
import { FormBuilder, Validators } from "@angular/forms";
import { Store } from "@ngrx/store";
import { tap } from "rxjs";
import { ROLE_LABELS } from "../../../data/frontend.models";
import * as A from "../store/admin.store";

@Component({
  selector: "sl-admin-panel",
  standalone: false,
  templateUrl: "./admin-panel.component.html",
})
export class AdminPanelComponent {
  private readonly store = inject(Store);
  readonly resources$ = this.store.select(A.selectAdminResources);
  readonly users$ = this.store.select(A.selectAdminUsers);
  readonly roles$ = this.store.select(A.selectAdminRoles);
  readonly busy$ = this.store.select(A.selectAdminBusy);
  readonly error$ = this.store.select(A.selectAdminError);
  readonly notice$ = this.store.select(A.selectAdminNotice);
  readonly saved$ = this.store.select(A.selectSavedResource).pipe(
    tap((resource) => {
      if (resource && this.creating) {
        this.creating = false;
        this.edit(resource);
      }
    }),
  );
  readonly labels = ROLE_LABELS;
  readonly form = inject(FormBuilder).nonNullable.group({
    type: inject(FormBuilder).nonNullable.control<"room" | "equipment">("room"),
    name: ["", [Validators.required, Validators.maxLength(100)]],
    description: ["", [Validators.required, Validators.maxLength(500)]],
    location: ["", Validators.maxLength(100)],
    amount: [
      1,
      [Validators.required, Validators.min(1), Validators.max(1000000)],
    ],
  });
  editing: string | null = null;
  editingName = "";
  mode = "";
  private creating = false;

  @Input({ required: true })
  set page(value: string) {
    this.mode = value;
    this.creating = false;
    this.store.dispatch(
      value === "resources" ? A.loadAdminResources() : A.loadAdminUsers(),
    );
  }

  edit(resource: A.AdminResource): void {
    this.editing = resource.id;
    this.editingName = resource.name;
    this.form.reset({
      type: resource.type,
      name: resource.name,
      description: resource.description,
      location: resource.location ?? "",
      amount: resource.capacity ?? resource.quantity ?? 1,
    });
    this.form.controls.type.disable();
  }

  reset(): void {
    this.editing = null;
    this.editingName = "";
    this.form.controls.type.enable();
    this.form.reset();
  }

  save(): void {
    if (this.form.invalid) return;
    const { amount, ...data } = this.form.getRawValue();
    this.creating = this.editing === null;
    this.store.dispatch(
      A.saveAdminResource({
        id: this.editing,
        resource: {
          ...data,
          capacity: data.type === "room" ? amount : null,
          quantity: data.type === "equipment" ? amount : null,
        },
      }),
    );
  }

  archive(id: string): void {
    this.creating = false;
    this.store.dispatch(A.archiveAdminResource({ id }));
  }

  upload(id: string, event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.item(0);
    if (file) this.store.dispatch(A.uploadAdminImage({ id, file }));
    input.value = "";
  }

  setRoles(id: string, roles: A.AdminRole[]): void {
    this.store.dispatch(A.saveAdminRoles({ id, roles }));
  }
}
