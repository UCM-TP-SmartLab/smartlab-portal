import { Injectable } from "@angular/core";
import {
  FrontendReservation,
  FrontendSession,
  UiArea,
  UiRequestStatus,
  UiRole,
} from "../../data/frontend.models";
@Injectable({ providedIn: "root" })
export class PermissionPolicyService {
  canAccess(role: UiRole, area: UiArea): boolean {
    if (area === "admin") return role === UiRole.Admin;
    if (area === "management")
      return role === UiRole.Manager || role === UiRole.Admin;
    return role === UiRole.Student;
  }
  canCancel(
    session: FrontendSession,
    reservation: FrontendReservation,
  ): boolean {
    return (
      session.role === UiRole.Student &&
      reservation.ownerId === session.id &&
      (reservation.status === UiRequestStatus.Pending ||
        reservation.status === UiRequestStatus.Approved)
    );
  }
}
