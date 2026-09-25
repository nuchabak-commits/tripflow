import { useMemo, useState } from "react";
import { MapPin, MapPinOff, Route } from "lucide-react";
import TripMap from "./TripMap";
import type { MapPoint, MapRoute } from "./TripMap";
import type { Stop, Trip } from "../types";
import { dateAt, dateLabel, dayCount, kindNames } from "../lib/trips";
import {
  dayColor,
  directionsUrl,
  km,
  located,
  routeKm,
} from "../lib/geo";
export type MapFilter = "all" | number;
const shortDate = (trip: Trip, day: number) =>
  dateLabel(dateAt(trip.startDate, day - 1)).replace(/ \d{4}$/, "");
export const dayName = (trip: Trip, day: number) =>
  day === 0 ? "Unscheduled" : `Day ${day} · ${shortDate(trip, day)}`;
/** Map data for one set of days, numbered by itinerary position. */
export function mapData(trip: Trip, days: number[]) {
  const points: MapPoint[] = [];
  const routes: (MapRoute & { day: number; km: number })[] = [];
  for (const day of days) {
    const stops = trip.stops.filter((s) => s.day === day);
    const color = dayColor(day);
    const pinned = stops.filter(located);
    stops.forEach((s, i) => {
      if (!located(s)) return;
      points.push({
        id: s.id,
        lat: s.lat,
        lng: s.lng,
        label: String(i + 1),
        color,
        title: s.title,
        detail: [dayName(trip, day), s.time, kindNames[s.kind]]
          .filter(Boolean)
          .join(" · "),
      });
    });
    if (day > 0 && pinned.length > 1)
      routes.push({
        id: "day-" + day,
        day,
        color,
        points: pinned,
        km: routeKm(pinned),
      });
  }
  return { points, routes };
}
export default function TripMapView({
  trip,
  filter,
  setFilter,
  edit,
}: {
  trip: Trip;
  filter: MapFilter;
  setFilter: (f: MapFilter) => void;
  edit: (s: Stop) => void;
}) {
  const [selected, setSelected] = useState<string | null>(null);
  const total = dayCount(trip);
  const allDays = Array.from({ length: total }, (_, i) => i + 1);
  const hasUnscheduled = trip.stops.some((s) => s.day === 0);
  if (hasUnscheduled) allDays.push(0);
  const days = filter === "all" ? allDays : [filter];
  const { points, routes } = useMemo(
    () => mapData(trip, days),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [trip, filter],
  );
  const listed = trip.stops.filter((s) => days.includes(s.day));
  const pinnedCount = listed.filter(located).length;
  const distance = routes.reduce((sum, r) => sum + r.km, 0);
  const choose = (f: MapFilter) => {
    setSelected(null);
    setFilter(f);
  };
  return (
    <section className="map-page">
      <div className="chips map-filter" role="group" aria-label="Map filter">
        <button
          className={filter === "all" ? "selected" : ""}
          aria-pressed={filter === "all"}
          onClick={() => choose("all")}
        >
          Whole trip
        </button>
        {allDays.map((d) => (
          <button
            key={d}
            className={filter === d ? "selected" : ""}
            aria-pressed={filter === d}
            onClick={() => choose(d)}
          >
            <i className="day-dot" style={{ background: dayColor(d) }} />
            {d === 0 ? "Unscheduled" : `Day ${d}`}
          </button>
        ))}
      </div>
      <div className="map-layout">
        <div className="map-frame">
          <TripMap
            className="full"
            label={`Map of ${trip.city}: ${filter === "all" ? "whole trip" : dayName(trip, filter)}`}
            points={points}
            routes={routes}
            selected={selected}
            onSelect={setSelected}
            onEdit={(id) => {
              const s = trip.stops.find((x) => x.id === id);
              if (s) edit(s);
            }}
            directions={directionsUrl}
            fitKey={`${trip.id}:${filter}:${points.length}`}
            scrollZoom
          />
          {!points.length && (
            <div className="map-empty">
              <MapPinOff size={26} />
              <b>No pinned places {filter === "all" ? "yet" : "for this day"}</b>
              <span>
                {listed.length
                  ? "Add a location to an activity to see it here."
                  : "Add activities in the itinerary, then pin them on the map."}
              </span>
            </div>
          )}
        </div>
        <aside className="panel map-list">
          <span className="eyebrow">
            {filter === "all" ? "THE WHOLE JOURNEY" : "THE DAY ON THE MAP"}
          </span>
          <h2>{filter === "all" ? trip.city : dayName(trip, filter)}</h2>
          <p className="muted">
            <MapPin size={13} /> {pinnedCount} of {listed.length} activities
            pinned
            {distance > 0 && (
              <>
                {" · "}
                <Route size={13} /> ≈ {km(distance)} straight-line
              </>
            )}
          </p>
          {!listed.length && (
            <p className="mini-empty">No activities planned here yet.</p>
          )}
          {days.map((d) => {
            const stops = trip.stops.filter((s) => s.day === d);
            if (!stops.length) return null;
            const route = routes.find((r) => r.day === d);
            return (
              <div className="map-day" key={d}>
                {filter === "all" && (
                  <h3>
                    <i className="day-dot" style={{ background: dayColor(d) }} />
                    {dayName(trip, d)}
                    {route && <small>≈ {km(route.km)}</small>}
                  </h3>
                )}
                <ol>
                  {stops.map((s, i) => (
                    <li
                      key={s.id}
                      className={selected === s.id ? "selected" : ""}
                    >
                      <span
                        className={"map-num" + (located(s) ? "" : " off")}
                        style={
                          located(s) ? { background: dayColor(d) } : undefined
                        }
                      >
                        {i + 1}
                      </span>
                      {located(s) ? (
                        <button
                          className="map-stop"
                          aria-pressed={selected === s.id}
                          onClick={() => setSelected(s.id)}
                        >
                          <b>{s.title}</b>
                          <small>
                            {s.time} · {kindNames[s.kind]}
                          </small>
                        </button>
                      ) : (
                        <div className="map-stop">
                          <b>{s.title}</b>
                          <small>
                            {s.time} · No location
                          </small>
                        </div>
                      )}
                      {!located(s) && (
                        <button
                          className="link"
                          aria-label={"Add location for " + s.title}
                          onClick={() => edit(s)}
                        >
                          Add location
                        </button>
                      )}
                    </li>
                  ))}
                </ol>
              </div>
            );
          })}
          <p className="muted map-note">
            Dashed lines connect pins in itinerary order; they are not travel
            routes. Use Directions for navigation.
          </p>
        </aside>
      </div>
    </section>
  );
}
