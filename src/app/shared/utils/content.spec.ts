import { describe, it, expect } from "vitest";
import {
  toSlug,
  normalizeHttpsUrl,
  isPublishableOpportunity,
  isUpcomingEvent,
  buildMonthDays,
} from "./content";
describe("Obsah a bezpečné odkazy", () => {
  it("prepisuje diakritiku", () =>
    expect(toSlug("Správy zo školy")).toBe("spravy-zo-skoly"));
  it("prijíma iba https a doménu", () => {
    expect(normalizeHttpsUrl("example.org")).toBe("https://example.org/");
    for (const url of [
      "javascript:alert(1)",
      "data:text/html,x",
      "http://example.org",
      "https://",
      "https://user:pass@example.org",
    ])
      expect(normalizeHttpsUrl(url)).toBeNull();
  });
  it("nezverejní testovaciu ponuku", () =>
    expect(isPublishableOpportunity(" Test ")).toBe(false));
  it("rozlišuje prebiehajúce a minulé podujatie", () => {
    expect(
      isUpcomingEvent(
        "2026-01-01T10:00:00Z",
        "2026-01-01T12:00:00Z",
        new Date("2026-01-01T11:00:00Z"),
      ),
    ).toBe(true);
    expect(
      isUpcomingEvent(
        "2026-01-01T10:00:00Z",
        undefined,
        new Date("2026-01-02T11:00:00Z"),
      ),
    ).toBe(false);
  });
  it("zostaví február aj bez udalostí", () =>
    expect(buildMonthDays(2026, 1).filter((d) => d.date).length).toBe(28));
});
