import { it, expect } from "vitest";
import { bratislavaCalendarDate } from "./bratislava-time";
it("zachová date-only a prevedie UTC okolo polnoci na deň podujatia", () => {
  expect(bratislavaCalendarDate("2026-12-15T23:30:00Z")).toBe("2026-12-16");
  expect(bratislavaCalendarDate("2026-07-15T22:30:00Z")).toBe("2026-07-16");
  expect(bratislavaCalendarDate("2026-12-15")).toBe("2026-12-15");
  expect(bratislavaCalendarDate("neplatne")).toBe("");
});
