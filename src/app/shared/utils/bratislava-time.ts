export type FrontendTimeResolution =
  | { kind: "valid"; utc: string }
  | { kind: "invalid" | "nonexistent" | "ambiguous" };
const formatter = new Intl.DateTimeFormat("en-CA", {
  timeZone: "Europe/Bratislava",
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
  hour: "2-digit",
  minute: "2-digit",
  hourCycle: "h23",
});
export function resolveBratislavaTime(
  date: string,
  time: string,
): FrontendTimeResolution {
  if (
    !/^\d{4}-\d{2}-\d{2}$/.test(date) ||
    !/^([01]\d|2[0-3]):[0-5]\d$/.test(time)
  )
    return { kind: "invalid" };
  const base = Date.parse(`${date}T${time}:00Z`);
  if (
    !Number.isFinite(base) ||
    new Date(base).toISOString().slice(0, 10) !== date
  )
    return { kind: "invalid" };
  // Bratislava má podľa IANA v podporovanom modernom období offset +01 alebo +02.
  const matches = [1, 2]
    .map((offset) => new Date(base - offset * 3600000))
    .filter((candidate) => {
      const parts = Object.fromEntries(
        formatter.formatToParts(candidate).map((p) => [p.type, p.value]),
      );
      return (
        `${parts["year"]}-${parts["month"]}-${parts["day"]}` === date &&
        `${parts["hour"]}:${parts["minute"]}` === time
      );
    });
  if (matches.length === 0) return { kind: "nonexistent" };
  if (matches.length > 1) return { kind: "ambiguous" };
  return { kind: "valid", utc: matches[0].toISOString() };
}
export function validateInterval(
  date: string,
  start: string,
  end: string,
  quantity: number,
): string | null {
  if (!Number.isInteger(quantity) || quantity < 1) return "quantity";
  const from = resolveBratislavaTime(date, start);
  const to = resolveBratislavaTime(date, end);
  if (from.kind !== "valid") return from.kind;
  if (to.kind !== "valid") return to.kind;
  return from.utc < to.utc ? null : "interval";
}
export function formatInstant(value: string): string {
  return new Intl.DateTimeFormat("sk-SK", {
    timeZone: "Europe/Bratislava",
    day: "numeric",
    month: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).format(new Date(value));
}
export function bratislavaToday(): string {
  const parts = Object.fromEntries(
    formatter.formatToParts(new Date()).map((p) => [p.type, p.value]),
  );
  return `${parts["year"]}-${parts["month"]}-${parts["day"]}`;
}
export function bratislavaCalendarDate(value: string): string {
  if (/^\d{4}-\d{2}-\d{2}$/.test(value)) return value;
  const instant = new Date(value);
  if (!Number.isFinite(instant.getTime())) return "";
  const parts = Object.fromEntries(
    formatter.formatToParts(instant).map((p) => [p.type, p.value]),
  );
  return `${parts["year"]}-${parts["month"]}-${parts["day"]}`;
}
