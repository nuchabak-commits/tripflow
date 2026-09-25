import type { Stop } from "../types";
export type LatLng = { lat: number; lng: number };
export type LocatedStop = Stop & LatLng;
export const validCoordinate = (lat: unknown, lng: unknown) =>
  typeof lat === "number" &&
  typeof lng === "number" &&
  Number.isFinite(lat) &&
  Number.isFinite(lng) &&
  lat >= -90 &&
  lat <= 90 &&
  lng >= -180 &&
  lng <= 180;
export const located = (s: Stop): s is LocatedStop =>
  validCoordinate(s.lat, s.lng);
const round = (n: number) => Math.round(n * 1e6) / 1e6;
export const formatCoordinates = (p: LatLng) =>
  `${round(p.lat)}, ${round(p.lng)}`;
/** Accepts "lat, lng", "lat lng", or a map link containing @lat,lng / q=lat,lng / ll=lat,lng. */
export function parseCoordinates(text: string): LatLng | null {
  let value = text.trim().replace(/\+/g, " ");
  try {
    value = decodeURIComponent(value);
  } catch {
    // keep the raw text when the link contains malformed escapes
  }
  const num = "(-?\\d{1,3}(?:\\.\\d+)?)";
  const patterns = [
    new RegExp(`^${num}\\s*[,;\\s]\\s*${num}$`),
    new RegExp(`@${num},${num}`),
    new RegExp(`[?&](?:q|query|ll|destination|mlat)=${num}(?:,|&mlon=)${num}`),
    new RegExp(`!3d${num}!4d${num}`),
    new RegExp(`#map=\\d+/${num}/${num}`),
  ];
  for (const p of patterns) {
    const m = value.match(p);
    if (!m) continue;
    const lat = +m[1],
      lng = +m[2];
    if (validCoordinate(lat, lng)) return { lat: round(lat), lng: round(lng) };
  }
  return null;
}
export function distanceKm(a: LatLng, b: LatLng) {
  const r = (d: number) => (d * Math.PI) / 180;
  const h =
    Math.sin(r(b.lat - a.lat) / 2) ** 2 +
    Math.cos(r(a.lat)) * Math.cos(r(b.lat)) * Math.sin(r(b.lng - a.lng) / 2) ** 2;
  return 2 * 6371.0088 * Math.asin(Math.min(1, Math.sqrt(h)));
}
export const routeKm = (points: LatLng[]) =>
  points.reduce((sum, p, i) => (i ? sum + distanceKm(points[i - 1], p) : 0), 0);
export const km = (n: number) =>
  n < 1
    ? `${Math.round(n * 1000).toLocaleString("en-US")} m`
    : `${n.toLocaleString("en-US", { maximumFractionDigits: 1 })} km`;
const palette = [
  "#1764e8",
  "#e8573f",
  "#17a36b",
  "#8d58e8",
  "#e08a12",
  "#0f9bb5",
  "#d63d86",
  "#5c6f1f",
];
export const dayColor = (day: number) =>
  day === 0 ? "#7b8ca2" : palette[(day - 1) % palette.length];
export const directionsUrl = (p: LatLng) =>
  `https://www.google.com/maps/dir/?api=1&destination=${p.lat},${p.lng}`;
