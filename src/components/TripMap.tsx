import { useEffect, useRef, useState } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import type { LatLng } from "../lib/geo";
export type MapPoint = LatLng & {
  id: string;
  label: string;
  color: string;
  title: string;
  detail: string;
  muted?: boolean;
};
export type MapRoute = { id: string; color: string; points: LatLng[] };
const TILE_URL =
  import.meta.env.VITE_MAP_TILE_URL ||
  "https://tile.openstreetmap.org/{z}/{x}/{y}.png";
const ATTRIBUTION =
  import.meta.env.VITE_MAP_ATTRIBUTION ||
  '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors';
const reducedMotion = () =>
  window.matchMedia?.("(prefers-reduced-motion: reduce)").matches ?? false;
const escape = (text: string) =>
  text.replace(/[&<>"']/g, (c) => `&#${c.charCodeAt(0)};`);
function icon(p: MapPoint, selected: boolean) {
  return L.divIcon({
    className: "trip-pin-wrap",
    html: `<span class="trip-pin${p.muted ? " muted" : ""}${selected ? " selected" : ""}" style="--pin:${escape(p.color)}">${escape(p.label)}</span>`,
    iconSize: p.muted ? [14, 14] : [28, 28],
    iconAnchor: p.muted ? [7, 7] : [14, 14],
    popupAnchor: [0, -14],
  });
}
function popup(
  p: MapPoint,
  onEdit?: (id: string) => void,
  directions?: (p: LatLng) => string,
) {
  const root = document.createElement("div");
  root.className = "trip-popup";
  const title = document.createElement("b");
  title.textContent = p.title;
  const detail = document.createElement("small");
  detail.textContent = p.detail;
  root.append(title, detail);
  const actions = document.createElement("div");
  if (onEdit) {
    const edit = document.createElement("button");
    edit.type = "button";
    edit.textContent = "Edit activity";
    edit.addEventListener("click", () => onEdit(p.id));
    actions.append(edit);
  }
  if (directions) {
    const link = document.createElement("a");
    link.href = directions(p);
    link.target = "_blank";
    link.rel = "noopener noreferrer";
    link.textContent = "Directions ↗";
    actions.append(link);
  }
  if (actions.childNodes.length) root.append(actions);
  return root;
}
export default function TripMap({
  points,
  routes = [],
  selected = null,
  onSelect,
  onEdit,
  directions,
  onPick,
  pick = null,
  focus = null,
  home = null,
  fitKey,
  label,
  className = "",
  scrollZoom = false,
}: {
  points: MapPoint[];
  routes?: MapRoute[];
  selected?: string | null;
  onSelect?: (id: string) => void;
  onEdit?: (id: string) => void;
  directions?: (p: LatLng) => string;
  /** Enables click-to-place and a draggable pin. */
  onPick?: (p: LatLng) => void;
  pick?: LatLng | null;
  /** When set, the next fit centers here instead of fitting every point. */
  focus?: LatLng | null;
  /** Where to look when there is nothing to fit, e.g. the destination city. */
  home?: LatLng | null;
  fitKey: string;
  label: string;
  className?: string;
  scrollZoom?: boolean;
}) {
  const el = useRef<HTMLDivElement>(null);
  const map = useRef<L.Map>();
  const layer = useRef<L.LayerGroup>();
  const markers = useRef(new Map<string, L.Marker>());
  const pin = useRef<L.Marker>();
  const handlers = useRef({ onSelect, onEdit, onPick, directions });
  handlers.current = { onSelect, onEdit, onPick, directions };
  const [tilesFailed, setTilesFailed] = useState(false);
  useEffect(() => {
    if (!el.current) return;
    const m = L.map(el.current, {
      scrollWheelZoom: scrollZoom,
      zoomSnap: 0.5,
      worldCopyJump: true,
    }).setView([20, 100], 2);
    let loaded = 0,
      failed = 0;
    L.tileLayer(TILE_URL, { attribution: ATTRIBUTION, maxZoom: 19 })
      .on("loading", () => (loaded = failed = 0))
      .on("tileload", () => loaded++)
      .on("tileerror", () => failed++)
      .on("load", () => setTilesFailed(failed > 0 && loaded === 0))
      .addTo(m);
    layer.current = L.layerGroup().addTo(m);
    m.on("click", (e: L.LeafletMouseEvent) =>
      handlers.current.onPick?.({ lat: e.latlng.lat, lng: e.latlng.lng }),
    );
    map.current = m;
    const resize = new ResizeObserver(() => m.invalidateSize());
    resize.observe(el.current);
    return () => {
      resize.disconnect();
      m.remove();
      map.current = undefined;
      pin.current = undefined;
      markers.current.clear();
    };
  }, [scrollZoom]);
  const signature = JSON.stringify([points, routes]);
  useEffect(() => {
    const group = layer.current;
    if (!group) return;
    group.clearLayers();
    markers.current.clear();
    for (const r of routes)
      if (r.points.length > 1)
        L.polyline(
          r.points.map((p) => [p.lat, p.lng]),
          { color: r.color, weight: 3, opacity: 0.75, dashArray: "6 7" },
        ).addTo(group);
    for (const p of points) {
      const marker = L.marker([p.lat, p.lng], {
        icon: icon(p, p.id === selected),
        title: p.title,
        alt: p.title,
        keyboard: !p.muted,
        zIndexOffset: p.muted ? -500 : 0,
      }).addTo(group);
      if (!p.muted) {
        marker.bindPopup(() =>
          popup(p, handlers.current.onEdit, handlers.current.directions),
        );
        marker.on("click", () => handlers.current.onSelect?.(p.id));
      }
      markers.current.set(p.id, marker);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [signature]);
  useEffect(() => {
    const m = map.current;
    if (!m) return;
    for (const p of points) markers.current.get(p.id)?.setIcon(icon(p, p.id === selected));
    const marker = selected ? markers.current.get(selected) : undefined;
    if (!marker) return;
    m.setView(marker.getLatLng(), Math.max(m.getZoom(), 14), {
      animate: !reducedMotion(),
    });
    marker.openPopup();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selected, signature]);
  useEffect(() => {
    const m = map.current;
    if (!m) return;
    if (!onPick || !pick) {
      pin.current?.remove();
      pin.current = undefined;
      return;
    }
    if (!pin.current) {
      pin.current = L.marker([pick.lat, pick.lng], {
        draggable: true,
        title: "Selected location",
        alt: "Selected location",
        icon: L.divIcon({
          className: "trip-pin-wrap",
          html: '<span class="trip-pin pick"></span>',
          iconSize: [30, 30],
          iconAnchor: [15, 15],
        }),
      })
        .on("dragend", (e) => {
          const p = (e.target as L.Marker).getLatLng();
          handlers.current.onPick?.({ lat: p.lat, lng: p.lng });
        })
        .addTo(m);
    } else pin.current.setLatLng([pick.lat, pick.lng]);
  }, [pick?.lat, pick?.lng, !!onPick]);
  useEffect(() => {
    const m = map.current;
    if (!m) return;
    const fit = () => {
      if (focus)
        return m.setView([focus.lat, focus.lng], Math.max(m.getZoom(), 15), {
          animate: false,
        });
      const all = points.map((p) => L.latLng(p.lat, p.lng));
      if (!all.length)
        return home
          ? m.setView([home.lat, home.lng], 12, { animate: false })
          : m.setView([20, 100], 2, { animate: false });
      if (all.length === 1) return m.setView(all[0], 14, { animate: false });
      m.fitBounds(L.latLngBounds(all), { padding: [36, 36], maxZoom: 15, animate: false });
    };
    m.whenReady(fit);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fitKey]);
  return (
    <div className={"trip-map " + (onPick ? "picking " : "") + className}>
      <div ref={el} className="trip-map-canvas" role="region" aria-label={label} />
      {tilesFailed && (
        <p className="map-offline" role="status">
          Map tiles could not load. Check your connection — pins and routes are
          still shown.
        </p>
      )}
    </div>
  );
}
