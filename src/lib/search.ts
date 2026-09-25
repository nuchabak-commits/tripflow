import type { Trip } from "../types";
import { cityByName } from "../data/places";
import { distanceKm, located, validCoordinate } from "./geo";
import type { LatLng } from "./geo";
export type PlaceResult = LatLng & {
  name: string;
  /** Short context such as "Nimmanhaemin, Chiang Mai". */
  area: string;
  kind: string;
  code?: string;
  source: "photon" | "nominatim";
  km?: number;
};
const PHOTON = "https://photon.komoot.io/api";
const NOMINATIM = "https://nominatim.openstreetmap.org/search";
/** Destination center: saved coordinates, a known city, or the pinned activities. */
export function tripCenter(trip: Trip): LatLng | null {
  if (validCoordinate(trip.lat, trip.lng))
    return { lat: trip.lat as number, lng: trip.lng as number };
  const city = cityByName(trip.city, trip.countryCode);
  if (city) return { lat: city.lat, lng: city.lng };
  const pins = trip.stops.filter(located);
  if (!pins.length) return null;
  return {
    lat: pins.reduce((a, s) => a + s.lat, 0) / pins.length,
    lng: pins.reduce((a, s) => a + s.lng, 0) / pins.length,
  };
}
const label = (v?: string) => (v || "").replace(/_/g, " ");
type PhotonFeature = {
  geometry: { coordinates: [number, number] };
  properties: Record<string, string | undefined>;
};
function fromPhoton(f: PhotonFeature): PlaceResult | null {
  const p = f.properties;
  const [lng, lat] = f.geometry.coordinates;
  const name = p.name || [p.housenumber, p.street].filter(Boolean).join(" ");
  if (!name || !validCoordinate(lat, lng)) return null;
  const area = [p.district || p.locality, p.city || p.county, p.state, p.country]
    .filter((x, i, a) => x && x !== name && a.indexOf(x) === i)
    .slice(0, 3)
    .join(", ");
  return {
    name,
    area,
    lat,
    lng,
    kind: label(p.osm_value),
    code: p.countrycode?.toUpperCase(),
    source: "photon",
  };
}
export async function searchPhoton(
  q: string,
  opts: { center?: LatLng | null; places?: boolean; signal?: AbortSignal; limit?: number } = {},
): Promise<PlaceResult[]> {
  const params = new URLSearchParams({ q, limit: String(opts.limit ?? 8) });
  if (opts.center) {
    params.set("lat", String(opts.center.lat));
    params.set("lon", String(opts.center.lng));
  }
  if (opts.places) {
    params.set("osm_tag", "place");
    params.set("lang", "en");
  }
  const res = await fetch(`${PHOTON}?${params}`, { signal: opts.signal });
  if (!res.ok) throw new Error("photon " + res.status);
  const data: { features: PhotonFeature[] } = await res.json();
  return data.features.map(fromPhoton).filter((x): x is PlaceResult => !!x);
}
export async function searchNominatim(
  q: string,
  opts: { center?: LatLng | null; signal?: AbortSignal } = {},
): Promise<PlaceResult[]> {
  const params = new URLSearchParams({
    q,
    format: "jsonv2",
    limit: "8",
    addressdetails: "1",
  });
  if (opts.center) {
    const d = 0.6;
    params.set(
      "viewbox",
      [opts.center.lng - d, opts.center.lat + d, opts.center.lng + d, opts.center.lat - d].join(","),
    );
  }
  const res = await fetch(`${NOMINATIM}?${params}`, {
    signal: opts.signal,
    headers: { "Accept-Language": `${navigator.language || "en"},th;q=0.8,en;q=0.7` },
  });
  if (!res.ok) throw new Error("nominatim " + res.status);
  const rows: {
    name?: string;
    display_name: string;
    lat: string;
    lon: string;
    type?: string;
    address?: Record<string, string>;
  }[] = await res.json();
  return rows
    .map((r): PlaceResult | null => {
      const lat = +r.lat,
        lng = +r.lon;
      if (!validCoordinate(lat, lng)) return null;
      const parts = r.display_name.split(", ");
      const name = r.name || parts[0];
      return {
        name,
        area: parts.filter((x) => x !== name && !/^\d+$/.test(x)).slice(0, 3).join(", "),
        lat,
        lng,
        kind: label(r.type),
        code: r.address?.country_code?.toUpperCase(),
        source: "nominatim",
      };
    })
    .filter((x): x is PlaceResult => !!x);
}
/** Merge providers, drop near-duplicates (same name within 150 m), nearest first when a center is known. */
export function mergeResults(lists: PlaceResult[][], center?: LatLng | null): PlaceResult[] {
  const out: PlaceResult[] = [];
  for (const r of lists.flat()) {
    const dupe = out.some(
      (o) =>
        o.name.toLowerCase() === r.name.toLowerCase() && distanceKm(o, r) < 0.15,
    );
    if (!dupe) out.push(center ? { ...r, km: distanceKm(center, r) } : r);
  }
  if (!center) return out;
  // Keep provider relevance for nearby results, but push far-away matches down.
  const near = out.filter((r) => (r.km ?? 0) <= 80),
    far = out.filter((r) => (r.km ?? 0) > 80).sort((a, b) => (a.km ?? 0) - (b.km ?? 0));
  return [...near, ...far];
}
export const isShortMapLink = (text: string) =>
  /(maps\.app\.goo\.gl|goo\.gl\/maps|g\.co\/kgs)/i.test(text);
export const googleMapsSearch = (q: string) =>
  `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(q)}`;
