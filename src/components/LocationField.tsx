import { useEffect, useRef, useState } from "react";
import { Search, X } from "lucide-react";
import TripMap from "./TripMap";
import type { MapPoint } from "./TripMap";
import { formatCoordinates, parseCoordinates } from "../lib/geo";
import type { LatLng } from "../lib/geo";
type Result = { name: string; lat: number; lng: number };
const SEARCH_URL = "https://nominatim.openstreetmap.org/search";
export default function LocationField({
  text,
  setText,
  query,
  context,
}: {
  text: string;
  setText: (value: string) => void;
  /** Default search text, e.g. "Taikoo Li, Chengdu". */
  query: string;
  /** Other pinned activities, shown faded so the picker opens near the trip. */
  context: MapPoint[];
}) {
  const parsed = parseCoordinates(text);
  const [search, setSearch] = useState("");
  const [results, setResults] = useState<Result[] | null>(null);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [focus, setFocus] = useState<{ n: number; at: LatLng | null }>({
    n: 0,
    at: parsed,
  });
  const abort = useRef<AbortController>();
  useEffect(() => () => abort.current?.abort(), []);
  const choose = (p: LatLng) => {
    setText(formatCoordinates(p));
    setFocus((f) => ({ n: f.n + 1, at: p }));
  };
  async function find() {
    const q = (search.trim() || query).trim();
    if (!q) return setMessage("Enter a place name to search.");
    abort.current?.abort();
    abort.current = new AbortController();
    setBusy(true);
    setMessage("");
    try {
      const res = await fetch(
        `${SEARCH_URL}?format=jsonv2&limit=5&q=${encodeURIComponent(q)}`,
        {
          signal: abort.current.signal,
          headers: { "Accept-Language": navigator.language || "en" },
        },
      );
      if (!res.ok) throw new Error(String(res.status));
      const rows: { display_name: string; lat: string; lon: string }[] =
        await res.json();
      const found = rows
        .map((r) => ({ name: r.display_name, lat: +r.lat, lng: +r.lon }))
        .filter((r) => parseCoordinates(`${r.lat}, ${r.lng}`));
      setResults(found);
      if (!found.length)
        setMessage("No matches. Try a shorter name, or tap the map instead.");
    } catch (e) {
      if ((e as Error).name !== "AbortError")
        setMessage(
          "Place search is unavailable (offline or rate-limited). Tap the map or paste coordinates instead.",
        );
    } finally {
      setBusy(false);
    }
  }
  return (
    <fieldset className="location-field">
      <legend>Location · optional</legend>
      <div className="location-search">
        <input
          aria-label="Search place"
          value={search}
          maxLength={200}
          placeholder={query || "Search a place"}
          onChange={(e) => setSearch(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              find();
            }
          }}
        />
        <button
          type="button"
          className="secondary"
          onClick={find}
          disabled={busy}
        >
          <Search size={15} /> {busy ? "Searching…" : "Search"}
        </button>
      </div>
      {results && results.length > 0 && (
        <ul className="location-results" aria-label="Search results">
          {results.map((r) => (
            <li key={`${r.lat},${r.lng},${r.name}`}>
              <button
                type="button"
                onClick={() => {
                  choose(r);
                  setResults(null);
                }}
              >
                {r.name}
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
      <TripMap
        className="picker"
        label="Location picker map. Click to place the pin."
        points={context}
        pick={parsed}
        onPick={choose}
        focus={focus.at}
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
            placeholder="30.6545, 104.0832"
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
      <small className="location-hint">
        Search, tap the map, drag the pin, or paste “lat, lng” or a Google
        Maps / OpenStreetMap link. Search by{" "}
        <a
          href="https://nominatim.org/"
          target="_blank"
          rel="noopener noreferrer"
        >
          OpenStreetMap Nominatim
        </a>
        .
      </small>
    </fieldset>
  );
}
