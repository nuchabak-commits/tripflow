import type { Trip, Stop } from "../types";
export const dateNumber = (value: string) => Date.parse(value + "T00:00:00Z");
export const validDate = (value: string) =>
  /^\d{4}-\d{2}-\d{2}$/.test(value) &&
  Number.isFinite(dateNumber(value)) &&
  new Date(dateNumber(value)).toISOString().slice(0, 10) === value;
export function today() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}
export const dayCount = (t: Pick<Trip, "startDate" | "endDate">) =>
  Math.round((dateNumber(t.endDate) - dateNumber(t.startDate)) / 86400000) + 1;
export const dateAt = (start: string, offset: number) =>
  new Date(dateNumber(start) + offset * 86400000).toISOString().slice(0, 10);
export const dateLabel = (date: string) =>
  new Date(date + "T12:00:00").toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
export const status = (
  t: Pick<Trip, "startDate" | "endDate">,
  now = today(),
) => (t.endDate < now ? "Past" : t.startDate > now ? "Upcoming" : "Ongoing");
export const money = (n: number) =>
  n.toLocaleString("en-US", { maximumFractionDigits: 2 });
export const coverStyle = (t: Trip) =>
  t.coverUrl
    ? {
        backgroundColor: "#205180",
        backgroundImage: `linear-gradient(90deg,rgba(10,30,55,.65),rgba(10,30,55,.12)),url(${JSON.stringify(t.coverUrl)})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
      }
    : undefined;
export function reschedule(
  trip: Trip,
  startDate: string,
  endDate: string,
  mode: "day" | "date",
): Stop[] {
  const count = dayCount({ startDate, endDate });
  return trip.stops.map((s) => {
    if (s.day === 0) return s;
    const next =
      mode === "day"
        ? s.day
        : Math.round(
            (dateNumber(trip.startDate) - dateNumber(startDate)) / 86400000,
          ) + s.day;
    return { ...s, day: next >= 1 && next <= count ? next : 0 };
  });
}
