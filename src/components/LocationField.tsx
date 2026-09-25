import { useEffect, useRef, useState } from "react";
import { ExternalLink, Search, X } from "lucide-react";
import TripMap from "./TripMap";
import type { MapPoint } from "./TripMap";
import type { Trip } from "../types";
import { formatCoordinates, km, parseCoordinates } from "../lib/geo";
import type { LatLng } from "../lib/geo";
import {
  googleMapsSearch,
  isShortMapLink,
  mergeResults,
  searchNominatim,
  searchPhoton,
  tripCenter,
} from "../lib/search";
import type { PlaceResult } from "../lib/search";
export default function LocationField({
  text,
  setText,
  title,
  trip,
  context,
}: {
  text: string;
  setText: (value: string) => void;
  /** The activity name; used as the search text until the user edits it. */
  title: string;
  trip: Trip;
  /** Other pinned activities, shown faded so the picker opens near the trip. */
  context: MapPoint[];
}) {
  const parsed = parseCoordinates(text);
  const center = tripCenter(trip);
  const [search, setSearch] = useState<string | null>(null);
  const query = (search ?? title).trim();
  const [results, setResults] = useState<PlaceResult[] | null>(null);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [live, setLive] = useState(false);
  const [focus, setFocus] = useState<{ n: number; at: LatLng | null }>({
    n: 0,
    at: parsed ?? (context.length ? null : center),
  });
  const abort = useRef<AbortController>();
  useEffect(() => () => abort.current?.abort(), []);
  const choose = (p: LatLng) => {
    setText(formatCoordinates(p));
    setFocus((f) => ({ n: f.n + 1, at: p }));
  };
  async function run(full: boolean) {
    if (!query) return setMessage("Enter a place name to search.");
    abort.current?.abort();
    const ctl = (abort.current = new AbortController());
    setBusy(true);
    setMessage("");
    const lists = await Promise.allSettled([
      searchPhoton(query, { center, signal: ctl.signal }),
      ...(full ? [searchNominatim(query, { center, signal: ctl.signal })] : []),
    ]);
    if (ctl.signal.aborted) return;
    setBusy(false);
    const ok = lists.filter(
      (r): r is PromiseFulfilledResult<PlaceResult[]> => r.status === "fulfilled",
    );
    if (!ok.length) {
      setResults(null);
      return setMessage(
        "Place search is unavailable (offline or rate-limited). Tap the map or paste coordinates instead.",
      );
    }
    const merged = mergeResults(ok.map((r) => r.value), center).slice(0, 8);
    setResults(merged);
    if (!merged.length)
      setMessage(
        full
          ? "Not found in OpenStreetMap. Small restaurants and shops are often missing — find it on Google Maps and paste the coordinates below."
          : "",
      );
  }
  // Live suggestions (Photon only) once the user edits the search box.
  useEffect(() => {
    if (!live || query.length < 2) return;
    const timer = setTimeout(() => run(false), 500);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query, live]);
  const where = [trip.city, trip.country].filter(Boolean).join(", ");
  return (
    <fieldset className="location-field">
      <legend>Location · optional</legend>
      <div className="location-search">
        <div className="combo-input">
          <Search size={16} className="combo-lead" />
          <input
            aria-label="Search place"
            value={search ?? title}
            maxLength={200}
            placeholder={`Search places near ${trip.city || "your destination"}`}
            onChange={(e) => {
              setSearch(e.target.value);
              setLive(true);
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                run(true);
              }
            }}
          />
        </div>
        <button
          type="button"
          className="secondary"
          onClick={() => run(true)}
          disabled={busy}
        >
          {busy ? "Searching…" : "Search"}
        </button>
      </div>
      {results && results.length > 0 && (
        <ul className="location-results" aria-label="Search results">
          {results.map((r) => (
            <li key={`${r.source}-${r.lat},${r.lng}-${r.name}`}>
              <button
                type="button"
                onClick={() => {
                  choose(r);
                  setResults(null);
                  setLive(false);
                }}
              >
                <b>{r.name}</b>
                <small>
                  {[r.kind, r.area].filter(Boolean).join(" · ")}
                  {r.km !== undefined && (
                    <em> · {km(r.km)} from {trip.city || "center"}</em>
                  )}
                </small>
              </button>
            </li>
          ))}
        </ul>
      )}
      {message && (
        <p className="location-message" role="status">
          {message}
        </p>
      )}
      <a
        className="gmaps-link"
        href={googleMapsSearch([query, where].filter(Boolean).join(" "))}
        target="_blank"
        rel="noopener noreferrer"
      >
        <ExternalLink size={13} /> Can’t find it? Search “{query || "place"}” on
        Google Maps
      </a>
      <TripMap
        className="picker"
        label="Location picker map. Click to place the pin."
        points={context}
        pick={parsed}
        onPick={choose}
        focus={focus.at}
        home={center}
        fitKey={String(focus.n)}
      />
      <div className="location-coords">
        <label>
          Coordinates
          <input
            value={text}
            inputMode="decimal"
            spellCheck={false}
            maxLength={2000}
            placeholder="Paste e.g. 18.79661, 98.96772"
            aria-invalid={!!text.trim() && !parsed}
            onChange={(e) => setText(e.target.value)}
            onBlur={() => {
              const p = parseCoordinates(text);
              if (p) choose(p);
            }}
          />
        </label>
        {text && (
          <button
            type="button"
            className="icon-btn"
            aria-label="Clear location"
            onClick={() => setText("")}
          >
            <X size={16} />
          </button>
        )}
      </div>
      {isShortMapLink(text) ? (
        <p className="location-message" role="alert">
          Short share links (maps.app.goo.gl) can’t be read by the browser.
          Open the link, then copy the coordinates (the numbers like 18.79661,
          98.96772) and paste them here.
        </p>
      ) : (
        <small className="location-hint">
          From Google Maps: right-click the place (computer) or press and hold
          it (phone), tap the coordinates to copy, then paste here. You can
          also tap this map or drag the pin. Search by OpenStreetMap (
          <a href="https://photon.komoot.io" target="_blank" rel="noopener noreferrer">
            Photon
          </a>
          ,{" "}
          <a href="https://nominatim.org/" target="_blank" rel="noopener noreferrer">
            Nominatim
          </a>
          ).
        </small>
      )}
    </fieldset>
  );
}
