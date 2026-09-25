# Changelog

## 0.4.0 — 2026-09-25

### Added
- Map tab (Leaflet + OpenStreetMap): numbered pins in itinerary order, colored per day, dashed straight-line route per day and total distance.
- Map filter: Whole trip / Day N / Unscheduled; list and map selection stay in sync; popup with Edit activity and Directions link.
- Optional activity coordinates (Stop.lat/lng): place search via OpenStreetMap Nominatim, tap the map or drag the pin, or paste "lat, lng" or a Google Maps / OpenStreetMap link.
- Itinerary: "Pinned" badge, a day map preview and an "Open full map" shortcut that keeps the selected day.
- Places section shows pinned counts and opens the Map tab.
- Offline notice when map tiles cannot load; pins and routes still render.
- Chengdu demo: coordinates and a Day 2 plan.
- Optional VITE_MAP_TILE_URL / VITE_MAP_ATTRIBUTION to use another tile provider.

### Fixed
- A failed migration backup copy no longer blocks loading saved data.

### Compatibility
- v0.4 writes to tripflow-v04; on first launch it reads tripflow-v03 (or tripflow-v02) and copies it to tripflow-v03-backup (or tripflow-v02-backup). Older keys are never modified.
- Stop.lat/lng are optional and must be present together; data without coordinates stays valid.

## 0.3.0 — 2026-09-25

### Added
- Trip editing and optional HTTPS cover images.
- Calendar-date/relative-day remapping with an Unscheduled holding area.
- Ongoing filter, live date status refresh and closest-trip selection.
- Overview progress, budget overrun display, contextual summary navigation.
- Activity day selection, keyboard drag support and explicit reorder controls.
- Custom confirmations, accessible dialogs, toast feedback and mobile navigation.
- JSON backup export and defensive storage migration.

### Fixed
- Oversized status badges inheriting the cover font size.
- In-progress trips classified as past.
- Hidden mobile edit/delete actions and mismatched timeline grid columns.
- Notes lost when navigating away without pressing Save.
- Settings clearing unrelated websites' LocalStorage keys.
- Floating-point day arithmetic affected by timezone/DST (uses calendar-day UTC arithmetic).
- Invalid dates, whitespace-only names and negative expense inputs.

### Compatibility
- Retains original Trip IDs and nested v0.2 record shapes; adds optional coverUrl.
- Keeps original tripflow-v02 and a migration backup; v0.3 writes to tripflow-v03.
- Stop.day=0 represents Unscheduled in v0.3.
