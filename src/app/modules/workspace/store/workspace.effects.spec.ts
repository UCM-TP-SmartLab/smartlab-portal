import {
  createEnvironmentInjector,
  EnvironmentInjector,
  Injector,
  runInInjectionContext,
} from "@angular/core";
import { Actions } from "@ngrx/effects";
import { Store } from "@ngrx/store";
import { EMPTY, firstValueFrom, Observable, of, toArray } from "rxjs";
import { describe, it, expect } from "vitest";
import { ProductionPortalProvider } from "../../../core/data/production-portal.provider";
import { PORTAL_PROVIDER } from "../../../core/data/portal-provider";
import { PortalErrorService } from "../../../core/errors/portal-error.service";
import { PermissionPolicyService } from "../../../core/auth/permission-policy.service";
import {
  FrontendAccessRequest,
  FrontendReservation,
  UiRequestStatus,
  UiRole,
} from "../../../data/frontend.models";
import { WorkspaceEffects } from "./workspace.effects";
import { requireResponse } from "./workspace.effects";
import { DemoPortalProvider } from "../../../core/data/demo-portal.provider";
import * as A from "./workspace.store";
class EmptyProvider extends ProductionPortalProvider {
  override createReservation(): Observable<FrontendReservation> {
    return EMPTY;
  }
  override cancelReservation(): Observable<FrontendReservation> {
    return EMPTY;
  }
  override createAccess(): Observable<FrontendAccessRequest> {
    return EMPTY;
  }
  override decide(): Observable<FrontendReservation | FrontendAccessRequest> {
    return EMPTY;
  }
}
describe("Effecty bez odpovede", () => {
  const draft = {
    resourceId: "demo-room",
    date: "2026-12-15",
    start: "12:00",
    end: "13:00",
    quantity: 1,
    purpose: "Projekt",
  };
  const cases = [
    { action: A.createBooking({ draft }), effect: "createBooking$" as const },
    { action: A.cancelBooking({ id: "r1" }), effect: "cancel$" as const },
    {
      action: A.createAccess({ draft: { purpose: "Projekt" } }),
      effect: "access$" as const,
    },
    {
      action: A.makeDecision({
        decision: {
          kind: "reservation",
          id: "r1",
          status: UiRequestStatus.Approved,
          reason: "",
        },
      }),
      effect: "decision$" as const,
    },
  ];
  it("null výsledok sa považuje za neplatnú odpoveď", () => {
    expect(() =>
      requireResponse(null as unknown as FrontendReservation),
    ).toThrow("invalid-response");
  });
  it("dve súčasné podania vytvoria iba jednu rezerváciu a jeden úspech", async () => {
    const provider = new DemoPortalProvider();
    const action = A.createBooking({ draft });
    const injector = createEnvironmentInjector(
      [
        { provide: Actions, useValue: new Actions(of(action, action)) },
        {
          provide: Store,
          useValue: {
            select: () =>
              of({ id: "demo-student", name: "Demo", role: UiRole.Student }),
          },
        },
        { provide: PORTAL_PROVIDER, useValue: provider },
        { provide: PortalErrorService, useValue: new PortalErrorService() },
        {
          provide: PermissionPolicyService,
          useValue: new PermissionPolicyService(),
        },
      ],
      Injector.NULL as EnvironmentInjector,
    );
    try {
      const effects = runInInjectionContext(
        injector,
        () => new WorkspaceEffects(),
      );
      const actions = await firstValueFrom(
        effects.createBooking$.pipe(toArray()),
      );
      expect(actions).toHaveLength(1);
      expect(actions[0].type).toBe(A.bookingCreated.type);
      expect(
        await firstValueFrom(provider.reservations("demo-student")),
      ).toHaveLength(1);
    } finally {
      injector.destroy();
    }
  });
  it.each(cases)(
    "$effect vytvorí failure pri dokončení bez výsledku",
    async ({ action, effect }) => {
      const injector = createEnvironmentInjector(
        [
          { provide: Actions, useValue: new Actions(of(action)) },
          {
            provide: Store,
            useValue: {
              select: () =>
                of({ id: "demo-student", name: "Demo", role: UiRole.Student }),
            },
          },
          { provide: PORTAL_PROVIDER, useValue: new EmptyProvider() },
          { provide: PortalErrorService, useValue: new PortalErrorService() },
          {
            provide: PermissionPolicyService,
            useValue: new PermissionPolicyService(),
          },
        ],
        Injector.NULL as EnvironmentInjector,
      );
      try {
        const effects = runInInjectionContext(
          injector,
          () => new WorkspaceEffects(),
        );
        const result = await firstValueFrom(effects[effect]);
        expect(result).toMatchObject({
          type: A.operationFailed.type,
          error: "Operácia nevrátila platný výsledok. Skúste to znova.",
        });
        expect(
          A.workspaceReducer({ ...A.initialWorkspace, busy: true }, result)
            .busy,
        ).toBe(false);
      } finally {
        injector.destroy();
      }
    },
  );
});
