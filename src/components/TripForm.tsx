import { useState } from "react";
import type { Trip } from "../types";
import { Modal } from "./UI";
import { coverStyle, dayCount, reschedule, validDate } from "../lib/trips";
export default function TripForm({
  trip,
  close,
  save,
}: {
  trip?: Trip;
  close: () => void;
  save: (t: Trip) => void;
}) {
  const [f, setF] = useState({
    city: trip?.city || "",
    country: trip?.country || "",
    startDate: trip?.startDate || "",
    endDate: trip?.endDate || "",
    budget: String(trip?.budget ?? 30000),
    coverUrl: trip?.coverUrl || "",
    emoji: trip?.emoji || "✈️",
    gradient: trip?.gradient || "hero-blue",
  });
  const [mode, setMode] = useState<"day" | "date">("day");
  const [approved, setApproved] = useState(false);
  const [error, setError] = useState("");
  const change = (key: string, v: string) => {
    setF({ ...f, [key]: v });
    setApproved(false);
  };
  const dateOK =
    validDate(f.startDate) &&
    validDate(f.endDate) &&
    dayCount(f) >= 1 &&
    dayCount(f) <= 366;
  const changed =
    !!trip && (f.startDate !== trip.startDate || f.endDate !== trip.endDate);
  const stops =
    trip && dateOK
      ? reschedule(trip, f.startDate, f.endDate, mode)
      : trip?.stops || [];
  const displaced = stops.filter(
    (s, i) => s.day === 0 && trip?.stops[i].day !== 0,
  ).length;
  return (
    <Modal close={close} title={trip ? "Edit trip" : "Create trip"}>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (!f.city.trim() || !f.country.trim())
            return setError("Destination and country are required.");
          if (!dateOK)
            return setError(
              "Choose a valid trip of 1–366 days. End date must follow start date.",
            );
          if (!f.budget.trim() || !Number.isFinite(+f.budget) || +f.budget < 0)
            return setError("Enter a budget of zero or more.");
          if (f.coverUrl) {
            try {
              if (new URL(f.coverUrl).protocol !== "https:") throw 0;
            } catch {
              return setError("Use a valid HTTPS image URL.");
            }
          }
          if (displaced && !approved)
            return setError(
              "Please confirm moving affected activities to Unscheduled.",
            );
          const base: Trip = trip || {
            id: crypto.randomUUID(),
            city: "",
            country: "",
            startDate: "",
            endDate: "",
            budget: 0,
            emoji: "✈️",
            gradient: "hero-blue",
            favorite: false,
            stops: [],
            expenses: [],
            packing: [],
            notes: "",
          };
          save({
            ...base,
            ...f,
            city: f.city.trim(),
            country: f.country.trim(),
            budget: +f.budget,
            stops,
          });
        }}
      >
        <div>
          <span className="eyebrow">YOUR NEXT CHAPTER</span>
          <h2>{trip ? "Edit your trip" : "Where to next?"}</h2>
        </div>
        <div
          className={"cover-preview " + f.gradient}
          style={
            f.coverUrl.startsWith("https://")
              ? coverStyle({ ...trip, ...f } as unknown as Trip)
              : undefined
          }
        >
          {f.emoji}
        </div>
        <div className="form-row">
          <label>
            Destination
            <input
              required
              maxLength={100}
              value={f.city}
              onChange={(e) => change("city", e.target.value)}
              placeholder="Chengdu"
            />
          </label>
          <label>
            Country
            <input
              required
              maxLength={100}
              value={f.country}
              onChange={(e) => change("country", e.target.value)}
              placeholder="China"
            />
          </label>
        </div>
        <div className="form-row">
          <label>
            Start date
            <input
              required
              type="date"
              value={f.startDate}
              onChange={(e) => change("startDate", e.target.value)}
            />
          </label>
          <label>
            End date
            <input
              required
              type="date"
              min={f.startDate}
              value={f.endDate}
              onChange={(e) => change("endDate", e.target.value)}
            />
          </label>
        </div>
        <label>
          Budget · THB
          <input
            required
            type="number"
            min="0"
            step="0.01"
            value={f.budget}
            onChange={(e) => change("budget", e.target.value)}
          />
        </label>
        <label>
          Cover image URL · optional
          <input
            type="url"
            value={f.coverUrl}
            onChange={(e) => change("coverUrl", e.target.value)}
            placeholder="https://…/photo.jpg"
          />
          <small>
            Use a publicly accessible HTTPS image. Leave blank for a color
            cover.
          </small>
        </label>
        <div className="form-row">
          <label>
            Travel icon
            <select
              value={f.emoji}
              onChange={(e) => change("emoji", e.target.value)}
            >
              {Array.from(
                new Set([
                  f.emoji,
                  "✈️",
                  "🐼",
                  "🌿",
                  "🌊",
                  "🌸",
                  "🏝️",
                  "🏔️",
                  "🌆",
                ]),
              ).map((x) => (
                <option key={x}>{x}</option>
              ))}
            </select>
          </label>
          <label>
            Cover color
            <select
              value={f.gradient}
              onChange={(e) => change("gradient", e.target.value)}
            >
              {["blue", "green", "teal", "pink"].map((x) => (
                <option key={x} value={"hero-" + x}>
                  {x}
                </option>
              ))}
            </select>
          </label>
        </div>
        {changed && trip.stops.length > 0 && (
          <div className="notice">
            <label>
              When trip dates change
              <select
                value={mode}
                onChange={(e) => {
                  setMode(e.target.value as "day" | "date");
                  setApproved(false);
                }}
              >
                <option value="day">Keep Day 1, Day 2… positions</option>
                <option value="date">Keep original calendar dates</option>
              </select>
            </label>
            {displaced > 0 && (
              <label className="check-label">
                <input
                  type="checkbox"
                  checked={approved}
                  onChange={(e) => setApproved(e.target.checked)}
                />
                Move {displaced} affected activities to Unscheduled. Nothing
                will be deleted.
              </label>
            )}
          </div>
        )}
        {error && (
          <p className="form-error" role="alert">
            {error}
          </p>
        )}
        <button className="primary wide">
          {trip ? "Save changes" : "Create trip"}
        </button>
      </form>
    </Modal>
  );
}
