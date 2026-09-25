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
export const kindNames = {
  flight: "Flight",
  hotel: "Hotel",
  place: "Place",
  photo: "Photo spot",
  food: "Food & drink",
} as const;
/** "dd/mm/yyyy" (also -, ., space or 8 digits); Buddhist-era years (> 2400) are converted. */
export function parseDateInput(text: string): string | null {
  const t = text.trim();
  const m =
    t.match(/^(\d{1,2})[/.\-\s](\d{1,2})[/.\-\s](\d{4})$/) ||
    t.match(/^(\d{2})(\d{2})(\d{4})$/);
  if (!m) return null;
  let year = +m[3];
  if (year > 2400) year -= 543;
  const iso = `${year}-${m[2].padStart(2, "0")}-${m[1].padStart(2, "0")}`;
  return validDate(iso) ? iso : null;
}
export const formatDateInput = (iso: string) =>
  validDate(iso) ? `${iso.slice(8, 10)}/${iso.slice(5, 7)}/${iso.slice(0, 4)}` : "";
export const longDate = (iso: string) =>
  new Date(iso + "T12:00:00").toLocaleDateString("en-GB", {
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric",
  });
/** 24-hour "HH:MM" from "13:00", "1300", "13.00", "9", "930", "1pm", "1:30 pm"; "" stays "". */
export function parseTime(text: string): string | null {
  const t = text.trim().toLowerCase().replace(/\s+/g, "").replace("น.", "");
  if (!t) return "";
  const m = t.match(/^(\d{1,2})(?:[:.h]?(\d{2}))?(am|pm|a|p)?$/);
  if (!m) return null;
  let h = +m[1];
  const min = m[2] ? +m[2] : 0;
  if (m[3]) {
    if (h < 1 || h > 12) return null;
    h = (h % 12) + (m[3].startsWith("p") ? 12 : 0);
  }
  if (h > 23 || min > 59) return null;
  return `${String(h).padStart(2, "0")}:${String(min).padStart(2, "0")}`;
}
