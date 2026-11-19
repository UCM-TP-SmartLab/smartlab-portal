import { describe, it, expect } from "vitest";
import {
  workspaceReducer,
  initialWorkspace,
  createBooking,
  bookingCreated,
  operationFailed,
  decisionMade,
  selectBookings,
} from "./workspace.store";
import { UiRequestStatus } from "../../../data/frontend.models";
const booking = {
  id: "r1",
  ownerId: "demo-student",
  resourceId: "demo-room",
  date: "2026-12-15",
  start: "12:00",
  end: "13:00",
  startUtc: "2026-12-15T11:00:00Z",
  endUtc: "2026-12-15T12:00:00Z",
  quantity: 1,
  purpose: "Projekt",
  status: UiRequestStatus.Pending,
  history: [],
};
describe("Stav pracovného priestoru", () => {
  it("nepridá rezerváciu pred potvrdením a zachová dáta pri chybe", () => {
    const state = { ...initialWorkspace, bookings: [booking] };
    const loading = workspaceReducer(state, createBooking({ draft: booking }));
    expect(loading.bookings).toHaveLength(1);
    const failed = workspaceReducer(
      loading,
      operationFailed({ error: "Konflikt" }),
    );
    expect(failed.bookings).toEqual([booking]);
    expect(failed.busy).toBe(false);
  });
  it("potvrdený výsledok pridá raz a selector vyberie kolekciu", () => {
    const state = workspaceReducer(
      initialWorkspace,
      bookingCreated({ booking }),
    );
    expect(selectBookings.projector(state)).toEqual([booking]);
    expect(
      workspaceReducer(state, bookingCreated({ booking })).bookings,
    ).toHaveLength(1);
  });
  it("rozhodnutie aktualizuje iba zodpovedajúci typ a ID", () => {
    const state = {
      ...initialWorkspace,
      bookings: [booking],
      access: [
        {
          id: "r1",
          ownerId: "demo-student",
          status: UiRequestStatus.Pending,
          purpose: "Prístup",
          history: [],
        },
      ],
    };
    const changed = workspaceReducer(
      state,
      decisionMade({
        kind: "reservation",
        item: { ...booking, status: UiRequestStatus.Approved },
      }),
    );
    expect(changed.bookings[0].status).toBe(UiRequestStatus.Approved);
    expect(changed.access[0].status).toBe(UiRequestStatus.Pending);
  });
});
