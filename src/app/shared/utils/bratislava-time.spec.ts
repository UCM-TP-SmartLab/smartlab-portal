import { describe, it, expect } from "vitest";
import {
  resolveBratislavaTime,
  validateInterval,
  formatInstant,
} from "./bratislava-time";
describe("Bratislavský čas", () => {
  it("odmietne neexistujúcu hodinu na jar", () =>
    expect(resolveBratislavaTime("2026-03-29", "02:30").kind).toBe(
      "nonexistent",
    ));
  it("odmietne dvojznačnú hodinu na jeseň", () =>
    expect(resolveBratislavaTime("2026-10-25", "02:30").kind).toBe(
      "ambiguous",
    ));
  it.each([
    ["2026-07-15", "2026-07-15T10:00:00.000Z"],
    ["2026-01-15", "2026-01-15T11:00:00.000Z"],
  ])("prevedie poludnie %s", (date, utc) =>
    expect(resolveBratislavaTime(date, "12:00")).toEqual({
      kind: "valid",
      utc,
    }),
  );
  it("odmietne neplatný dátum", () =>
    expect(resolveBratislavaTime("2026-02-30", "12:00").kind).toBe("invalid"));
  it("nepovolí prázdny alebo obrátený interval", () => {
    expect(validateInterval("2026-07-15", "12:00", "12:00", 1)).toBe(
      "interval",
    );
    expect(validateInterval("2026-07-15", "13:00", "12:00", 1)).toBe(
      "interval",
    );
    expect(validateInterval("2026-07-15", "12:00", "13:00", 0)).toBe(
      "quantity",
    );
    expect(validateInterval("2026-07-15", "12:00", "13:00", 1)).toBeNull();
  });
  it("zobrazí UTC v slovenskom pásme", () =>
    expect(formatInstant("2026-07-15T10:00:00Z")).toContain("12:00"));
});
