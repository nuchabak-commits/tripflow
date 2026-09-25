# Changelog

## 0.4.0 — 2026-09-25

### Added
- Map tab (Leaflet + OpenStreetMap): numbered pins in itinerary order, colored per day, dashed straight-line route per day and total distance.
- Map filter: Whole trip / Day N / Unscheduled; list and map selection stay in sync; popup with Edit activity and Directions link.
- Optional activity coordinates (Stop.lat/lng): place search via OpenStreetMap Nominatim, tap the map or drag the pin, or paste "lat, lng" or a Google Maps / OpenStreetMap link.
- Itinerary: "Pinned" badge, a day map preview and an "Open full map" shortcut that keeps the selected day.
- Places section shows pinned counts and opens the Map tab.
- Offline notice when map tiles cannot load; pins and routes still render.
- Optional VITE_MAP_TILE_URL / VITE_MAP_ATTRIBUTION to use another tile provider.

### Improved forms (feedback round)
- Place search queries Photon and Nominatim together, biased to the trip's destination, with live suggestions, distance from the destination center and merged duplicates.
- "Can't find it?" Google Maps link for places missing from OpenStreetMap, with guidance to copy coordinates; short share links (maps.app.goo.gl) are detected and explained.
- Destination is a searchable list (English or Thai, about 200 popular cities plus online search) and picking a city fills the country automatically; Country is a searchable list of all countries (English/Thai names).
- Dates are entered and shown as day/month/year with a calendar button; Buddhist-era years (e.g. 2569) are accepted.
- Time is 24-hour with shortcuts ("930", "1pm", "19.00 น.") and half-hour suggestions; no AM/PM picker.
- Any emoji (or 1–2 characters) as the trip icon, with a suggestion grid; 8 cover colors as swatches.
- Live trip-card preview, budget with thousands separators, category buttons with icons and quick duration chips.
- Trip may store countryCode and a destination center (lat/lng), used to center maps and place search.

### Changed
- A browser with no saved data starts with an empty workspace; sample trips are no longer created. Sample data moved to tests/fixtures/demo-trips.ts for tests only. Existing saved trips are not affected.

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
