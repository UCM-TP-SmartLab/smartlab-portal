import { FrontendCalendarDay } from "../../data/frontend.models";
export function toSlug(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}
export function normalizeHttpsUrl(value: string): string | null {
  const raw = value.trim();
  if (!raw || (/^[a-z][a-z\d+.-]*:/i.test(raw) && !raw.startsWith("https://")))
    return null;
  try {
    const url = new URL(raw.startsWith("https://") ? raw : `https://${raw}`);
    return url.protocol === "https:" &&
      url.hostname.includes(".") &&
      !url.username &&
      !url.password
      ? url.href
      : null;
  } catch {
    return null;
  }
}
export function isPublishableOpportunity(title: string): boolean {
  return title.trim().toLowerCase() !== "test";
}
export function isUpcomingEvent(
  start: string | undefined,
  end: string | undefined,
  now: Date,
): boolean {
  return (
    !!start &&
    Number.isFinite(Date.parse(start)) &&
    Date.parse(end || start) >= now.getTime()
  );
}
export function buildMonthDays(
  year: number,
  month: number,
): readonly FrontendCalendarDay[] {
  const offset = (new Date(Date.UTC(year, month, 1)).getUTCDay() + 6) % 7;
  const count = new Date(Date.UTC(year, month + 1, 0)).getUTCDate();
  return [
    ...Array.from({ length: offset }, () => ({ date: null, label: "" })),
    ...Array.from({ length: count }, (_, index) => ({
      date: `${year}-${String(month + 1).padStart(2, "0")}-${String(index + 1).padStart(2, "0")}`,
      label: String(index + 1),
    })),
  ];
}
