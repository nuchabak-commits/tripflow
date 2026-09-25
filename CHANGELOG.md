# Changelog

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
