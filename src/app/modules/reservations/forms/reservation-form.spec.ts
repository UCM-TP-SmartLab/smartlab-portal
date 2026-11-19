import { it, expect } from "vitest";
import { ReservationFormFactory } from "./reservation-form.factory";
it("form factory odmietne nulové množstvo, rovnaký čas a prázdny účel", () => {
  const form = new ReservationFormFactory().create("demo-room");
  form.setValue({
    resourceId: "demo-room",
    date: "2026-12-15",
    start: "12:00",
    end: "12:00",
    quantity: 0,
    purpose: "",
  });
  expect(form.valid).toBe(false);
  form.patchValue({ end: "13:00", quantity: 1, purpose: "Projekt" });
  expect(form.valid).toBe(true);
});
