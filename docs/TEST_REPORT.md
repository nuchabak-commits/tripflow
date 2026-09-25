# v0.3 verification — 2026-09-25

## Passed

- TypeScript strict compilation and Vite production build.
- `npm test`: calendar-day math; inclusive trip start/end status; leap/invalid dates; relative-day and calendar-date remapping; v0.2 migration and backup; empty saved workspace; malformed-data preservation; negative budgets and duplicate IDs.
- Chromium 153 browser run at 1440px desktop and 390px mobile:
  - Earliest upcoming trip featured; two past demo trips correctly labeled.
  - Migration from a legacy-only LocalStorage workspace with exact original backup.
  - Trip title and date editing.
  - Add an activity, reorder via arrow, move to Unscheduled and another day.
  - Shrink dates: save blocked until explicit confirmation; affected activity remains available.
  - Add an expense; cancel its delete confirmation without losing the expense.
  - Add and check a packing item.
  - Notes survive navigation and full reload without an explicit save action.
  - Mobile edit/delete controls work; deletion confirmation removes only the selected activity.
  - No document horizontal overflow at 390px on dashboard and itinerary.
  - JSON export triggers a browser download.
  - No JavaScript page errors during the scenario.

## Visual review

Dashboard, overview and mobile itinerary were inspected in headless Chromium.
The headless environment has incomplete Thai/emoji font support; the app uses
platform font fallbacks. Native Thai/emoji rendering requires a real-device check.

## Not verified here

- Safari/iOS and real Android devices.
- User-supplied external image hosts, availability or hotlink restrictions.
- An actual full-storage/quota-exceeded browser (the application handles write failures).
- Hosted deployment or GitHub integration.

`npm test` is included for repeatable model regression checks. Browser checks were
run in the build environment and are documented above; Playwright is not an
application dependency.
