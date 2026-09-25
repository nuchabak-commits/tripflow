# v0.4 verification — 2026-09-25

## Passed

- TypeScript strict compilation and Vite production build (`npm run build`).
- `npm test` (model regression; all v0.3 checks still included):
  - Coordinate parsing: `lat, lng`, space/semicolon separated, Google Maps `@lat,lng`, `query=`, `!3d…!4d…`, OpenStreetMap `#map=` and `mlat/mlon` links; out-of-range, plain text, empty and malformed-escape input rejected.
  - Great-circle distance (1° latitude ≈ 111.19 km, across the antimeridian), route totals, `m`/`km` formatting.
  - Storage validation: lat without lng, out-of-range and string coordinates rejected; data without coordinates stays valid.
  - v0.3 → v0.4 migration: v0.3 key untouched, `tripflow-v03-backup` created, loading never writes the new key; the v0.4 key takes precedence; v0.2-only workspaces still migrate; corrupt v0.3 data is reported and left untouched; a browser with no saved data starts empty and writes nothing on load.
  - The test fixture (tests/fixtures/demo-trips.ts, used to seed browser tests) passes validation, has pins on more than one day and includes an unpinned activity.
  - Date input dd/mm/yyyy (separators, 8 digits, Buddhist-era years, invalid dates, month/day order rejected); 24-hour time shortcuts (`930`, `1pm`, `12am`, `19.00 น.`) and invalid times.
  - City search in English/Thai (`chiang`, `เกียว` → Kyoto), country lookup by English/Thai name, every bundled city valid and unique, all fixture countries recognised.
  - Search result merging: cross-provider duplicates removed, far results after nearby ones, trip center from saved coordinates / known city / pinned activities, short-link detection.
- Browser run (Playwright 1.63, headless Chromium 1234, production `vite preview`): **49/49**
  - First launch: no sample trips, empty dashboard and summary pages, first trip created from the empty state persists alone after reload.
  - Other scenarios seed the sample trips from the test fixture.
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
  - Trip form: Thai city search (`เชียงใ`) picks Chiang Mai and fills Thailand; online city (Photon mocked) fills Laos from its country code; country must come from the list, Thai name `ญี่ปุ่น` accepted; digits auto-format to dd/mm/yyyy, BE year accepted, invalid date message; budget `45,000`; custom emoji and new cover color; saved trip has countryCode and destination center; editing Chengdu keeps its values.
  - Activity form: category buttons, time `1pm` → 13:00, `930` → 09:30, pick 19:30 from the list, invalid 25:00 blocked, duration chips; unknown Thai place queries both providers and shows the Google Maps fallback with the right query; short share link explained; pasted coordinates saved; live suggestions show distance from the destination.
  - Mobile 390px: trip and activity forms (with open city list) have no horizontal scroll.
  - No JavaScript page errors in any scenario.

## Visual review

Screenshots of the whole-trip map, the Day 1 map, the itinerary map preview, the mobile map and the
mobile location form were reviewed. Defects found and fixed during review: the Leaflet
attribution inherited a 16px font from the app styles; a date field cleared the user's
text when a valid date was edited into an invalid one; the Country field could lag one
render behind a picked city; flag emoji do not render on Windows, so country codes are
shown as badges instead.

## Not verified here

- Safari/iOS and real Android devices (touch dragging of the picker pin, pinch zoom).
- Live Photon/Nominatim results in the browser run (mocked so results are repeatable). A manual check against the live services confirmed that Thai names of places in OpenStreetMap are found (e.g. วัดพระธาตุดอยสุเทพ, ประตูท่าแพ) and that some small restaurants (e.g. ต้องเต็มโต๊ะ) are not in OpenStreetMap at all.
- OSM tile usage limits under real traffic; a production tile provider is recommended for deployment.
- Hosted deployment or GitHub integration.

Playwright is not an application dependency; browser checks were run from a separate scratch environment.
