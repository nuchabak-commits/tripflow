import type { Trip } from "../types";
import { validDate, dayCount } from "./trips";
import { validCoordinate } from "./geo";
export const KEY = "tripflow-v04",
  PREVIOUS = "tripflow-v03",
  LEGACY = "tripflow-v02";
export function validateTrips(value: unknown): value is Trip[] {
  if (!Array.isArray(value)) return false;
  const text = (v: unknown) => typeof v === "string";
  const amount = (v: unknown) =>
    typeof v === "number" && Number.isFinite(v) && v >= 0;
  const unique = (a: { id: string }[]) =>
    new Set(a.map((x) => x.id)).size === a.length;
  return (
    value.every(
      (t) =>
        t &&
        text(t.id) &&
        text(t.city) &&
        text(t.country) &&
        validDate(t.startDate) &&
        validDate(t.endDate) &&
        dayCount(t) >= 1 &&
        dayCount(t) <= 366 &&
        amount(t.budget) &&
        text(t.emoji) &&
        text(t.gradient) &&
        typeof t.favorite === "boolean" &&
        text(t.notes) &&
        (!t.coverUrl ||
          (typeof t.coverUrl === "string" && /^https:\/\//.test(t.coverUrl))) &&
        Array.isArray(t.stops) &&
        t.stops.every(
          (s: any) =>
            s &&
            text(s.id) &&
            Number.isInteger(s.day) &&
            s.day >= 0 &&
            s.day <= dayCount(t) &&
            text(s.time) &&
            text(s.title) &&
            text(s.note) &&
            text(s.duration) &&
            ["flight", "hotel", "place", "photo", "food"].includes(s.kind) &&
            ((s.lat === undefined && s.lng === undefined) ||
              validCoordinate(s.lat, s.lng)),
        ) &&
        unique(t.stops) &&
        Array.isArray(t.expenses) &&
        t.expenses.every(
          (e: any) =>
            e &&
            text(e.id) &&
            text(e.category) &&
            text(e.description) &&
            amount(e.amount),
        ) &&
        unique(t.expenses) &&
        Array.isArray(t.packing) &&
        t.packing.every(
          (p: any) =>
            p && text(p.id) && text(p.name) && typeof p.packed === "boolean",
        ) &&
        unique(t.packing),
    ) && unique(value)
  );
}
export function loadTrips(seed: Trip[]): { trips: Trip[]; error: string } {
  try {
    const current = localStorage.getItem(KEY),
      previous = localStorage.getItem(PREVIOUS),
      legacy = localStorage.getItem(LEGACY);
    const raw = current ?? previous ?? legacy;
    if (raw === null) return { trips: seed, error: "" };
    const parsed = JSON.parse(raw);
    if (!validateTrips(parsed)) throw new Error("Invalid data");
    if (current === null)
      try {
        if (previous !== null)
          localStorage.setItem("tripflow-v03-backup", previous);
        else if (legacy !== null)
          localStorage.setItem("tripflow-v02-backup", legacy);
      } catch {
        // The source key is never modified, so a failed backup copy is not fatal.
      }
    return { trips: parsed, error: "" };
  } catch {
    return {
      trips: [],
      error:
        "Saved data could not be loaded. The original data has not been overwritten. Export the saved data in Settings before recovering it.",
    };
  }
}
