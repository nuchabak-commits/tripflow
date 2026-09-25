# v0.4 verification — 2026-09-25

## Passed

- TypeScript strict compilation and Vite production build (`npm run build`).
- `npm test` (model regression; all v0.3 checks still included):
  - Coordinate parsing: `lat, lng`, space/semicolon separated, Google Maps `@lat,lng`, `query=`, `!3d…!4d…`, OpenStreetMap `#map=` and `mlat/mlon` links; out-of-range, plain text, empty and malformed-escape input rejected.
  - Great-circle distance (1° latitude ≈ 111.19 km, across the antimeridian), route totals, `m`/`km` formatting.
  - Storage validation: lat without lng, out-of-range and string coordinates rejected; data without coordinates stays valid.
  - v0.3 → v0.4 migration: v0.3 key untouched, `tripflow-v03-backup` created, loading never writes the new key; the v0.4 key takes precedence; v0.2-only workspaces still migrate; corrupt v0.3 data is reported and never replaced by demo data.
  - Demo seed passes validation, has pins on more than one day and includes an unpinned activity.
- Browser run (Playwright 1.63, headless Chromium 1234, production `vite preview`): **28/28**
  - Desktop 1440px: whole trip shows 7 pins / 2 routes; Day 1 and Day 2 counts and in-order numbering are correct; Day 3 shows the empty state.
  - Clicking a list row opens a popup with a Directions link and highlights the pin; clicking a marker selects its list row; a focused marker opens its popup on Enter.
  - Edit in the popup opens the form with coordinates filled in; pasting a Google Maps link pins an activity; invalid coordinates block saving; Clear location removes lat/lng from storage.
  - Add an activity through place search (Nominatim mocked); tap-to-pin in the picker; Open full map keeps the selected day.
  - An activity name containing HTML shows as plain text in the popup (no script execution).
  - Pins persist after reload; the Places section shows pinned counts and opens the Map tab.
  - Tiles blocked (offline): the notice appears and pins and routes still render.
  - v0.3 workspace (unscheduled activity, expenses, cover URL, notes): loads; the backup equals the original; the v0.3 key is unchanged after edits; the v0.4 key holds the new coordinates. A pinned unscheduled activity shows a grey pin with no route.
  - Mobile 390px: map above the list, day chips scroll horizontally, no document overflow, sticky tabs stay above the map layers, and the location form fits the screen.
  - Real OpenStreetMap tiles load with attribution (visual check on desktop).
  - No JavaScript page errors in any scenario.

## Visual review

Screenshots of the whole-trip map, the Day 1 map, the itinerary map preview, the mobile map and the
mobile location form were reviewed. One defect was found and fixed during review: the Leaflet
attribution inherited a 16px font from the app styles.

## Not verified here

- Safari/iOS and real Android devices (touch dragging of the picker pin, pinch zoom).
- Live Nominatim results (the service was mocked so results are repeatable).
- OSM tile usage limits under real traffic; a production tile provider is recommended for deployment.
- Hosted deployment or GitHub integration.

Playwright is not an application dependency; browser checks were run from a separate scratch environment.
