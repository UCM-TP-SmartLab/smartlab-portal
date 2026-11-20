import { describe, it, expect } from "vitest";
import { firstValueFrom } from "rxjs";
import { ProductionPortalProvider } from "./production-portal.provider";
import { DemoPortalProvider } from "./demo-portal.provider";
import { PermissionPolicyService } from "../auth/permission-policy.service";
import { UiRole, UiRequestStatus } from "../../data/frontend.models";
const draft = {
  resourceId: "demo-room",
  date: "2026-12-15",
  start: "12:00",
  end: "13:00",
  quantity: 1,
  purpose: "Práca na projekte",
};
describe("Provider a politika prístupu", () => {
  it("produkcia odmietne zápis aj požiadavku na dostupnosť", async () => {
    const provider = new ProductionPortalProvider();
    await expect(
      firstValueFrom(provider.createReservation(draft, "demo-student")),
    ).rejects.toMatchObject({ code: "unavailable" });
    await expect(
      firstValueFrom(provider.availability("demo-room", draft.date)),
    ).rejects.toMatchObject({ code: "unavailable" });
    expect(await firstValueFrom(provider.resources())).toEqual([]);
  });
  it("guard policy rozlišuje správcu a administrátora", () => {
    const policy = new PermissionPolicyService();
    expect(policy.canAccess(UiRole.Visitor, "student")).toBe(false);
    expect(policy.canAccess(UiRole.Student, "management")).toBe(false);
    expect(policy.canAccess(UiRole.Manager, "admin")).toBe(false);
    expect(policy.canAccess(UiRole.Admin, "management")).toBe(true);
  });
  it("demo konflikt nemení zoznam a povoľuje nadväzujúci interval", async () => {
    const provider = new DemoPortalProvider();
    const created = await firstValueFrom(
      provider.createReservation(draft, "demo-student"),
    );
    await expect(
      firstValueFrom(provider.createReservation(draft, "demo-student")),
    ).rejects.toMatchObject({ code: "conflict" });
    expect(
      (await firstValueFrom(provider.reservations("demo-student"))).filter(
        (r) => r.id === created.id,
      ),
    ).toHaveLength(1);
    await expect(
      firstValueFrom(
        provider.createReservation(
          { ...draft, start: "13:00", end: "14:00" },
          "demo-student",
        ),
      ),
    ).resolves.toMatchObject({ status: UiRequestStatus.Pending });
  });
  it("študent nesmie zrušiť cudziu rezerváciu", async () => {
    const provider = new DemoPortalProvider();
    const created = await firstValueFrom(
      provider.createReservation(draft, "someone-else"),
    );
    await expect(
      firstValueFrom(provider.cancelReservation(created.id, "demo-student")),
    ).rejects.toMatchObject({ code: "forbidden" });
  });
  it("záporné množstvo a prázdny účel sa neuložia", async () => {
    const provider = new DemoPortalProvider();
    await expect(
      firstValueFrom(
        provider.createReservation({ ...draft, quantity: 0 }, "demo-student"),
      ),
    ).rejects.toMatchObject({ code: "invalid" });
    await expect(
      firstValueFrom(provider.createAccess({ purpose: "" }, "demo-student")),
    ).rejects.toMatchObject({ code: "invalid" });
  });
  it("rozhodnutie vyžaduje správcu a dôvod zamietnutia", async () => {
    const provider = new DemoPortalProvider();
    const created = await firstValueFrom(
      provider.createAccess({ purpose: "Výskumný projekt" }, "demo-student"),
    );
    const decision = {
      kind: "access" as const,
      id: created.id,
      status: UiRequestStatus.Rejected as const,
      reason: "Doplňte účel",
    };
    await expect(
      firstValueFrom(provider.decide(decision, UiRole.Student)),
    ).rejects.toMatchObject({ code: "forbidden" });
    await expect(
      firstValueFrom(
        provider.decide({ ...decision, reason: "" }, UiRole.Manager),
      ),
    ).rejects.toMatchObject({ code: "invalid" });
    await firstValueFrom(provider.decide(decision, UiRole.Manager));
    expect(
      (await firstValueFrom(provider.accessRequests("demo-student"))).find(
        (a) => a.id === created.id,
      )?.reason,
    ).toBe("Doplňte účel");
  });
});
