const ts = require("typescript");
const fs = require("fs");
const vm = require("vm");
const assert = require("node:assert/strict");
function moduleAt(path, deps = {}) {
  const js = ts.transpileModule(fs.readFileSync(path, "utf8"), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 },
  }).outputText;
  const exports = {};
  const context = {
    exports,
    require: (n) => deps[n],
    console,
    Date,
    Set,
    Number,
    localStorage: store,
    crypto: globalThis.crypto,
    Intl,
  };
  vm.runInNewContext(js, context);
  return exports;
}
const same = (a, b) => assert.deepEqual({ ...a }, b);
const data = new Map();
const store = {
  getItem: (k) => data.get(k) ?? null,
  setItem: (k, v) => data.set(k, v),
};
const dates = moduleAt("./src/lib/trips.ts");
const geo = moduleAt("./src/lib/geo.ts");
const storage = moduleAt("./src/lib/storage.ts", {
  "./trips": dates,
  "./geo": geo,
});
const t = {
  id: "test",
  city: "Test",
  country: "TH",
  startDate: "2026-09-25",
  endDate: "2026-09-27",
  budget: 100,
  emoji: "x",
  gradient: "hero-blue",
  favorite: false,
  notes: "",
  stops: [
    {
      id: "s",
      day: 3,
      time: "09:00",
      title: "Last day",
      note: "",
      duration: "1h",
      kind: "place",
    },
  ],
  expenses: [],
  packing: [],
};
assert.equal(dates.status(t, "2026-09-24"), "Upcoming");
assert.equal(dates.status(t, "2026-09-25"), "Ongoing");
assert.equal(dates.status(t, "2026-09-27"), "Ongoing");
assert.equal(dates.status(t, "2026-09-28"), "Past");
assert.equal(dates.dayCount(t), 3);
assert.equal(dates.validDate("2026-02-30"), false);
assert.equal(dates.validDate("2028-02-29"), true);
assert.equal(dates.reschedule(t, "2026-09-25", "2026-09-26", "day")[0].day, 0);
assert.equal(dates.reschedule(t, "2026-09-26", "2026-09-28", "date")[0].day, 2);
assert.equal(dates.reschedule(t, "2026-09-26", "2026-09-28", "day")[0].day, 3);
store.setItem(storage.LEGACY, JSON.stringify([t]));
assert.equal(storage.loadTrips().trips[0].stops[0].title, "Last day");
assert.equal(
  store.getItem("tripflow-v02-backup"),
  store.getItem(storage.LEGACY),
);
store.setItem(storage.KEY, "[]");
assert.equal(storage.loadTrips().trips.length, 0);
// a browser with no saved data starts empty (no demo trips)
data.clear();
const empty = storage.loadTrips();
assert.deepEqual([[...empty.trips], empty.error], [[], ""]);
assert.equal(data.size, 0, "loading an empty browser writes nothing");
store.setItem(storage.KEY, "[]");
store.setItem(storage.KEY, "broken");
assert.ok(storage.loadTrips().error);
assert.equal(store.getItem(storage.KEY), "broken");
assert.equal(storage.validateTrips([{ ...t, budget: -1 }]), false);
assert.equal(storage.validateTrips([t, t]), false);
// v0.4 coordinates
same(geo.parseCoordinates("30.6545, 104.0832"), { lat: 30.6545, lng: 104.0832 });
same(geo.parseCoordinates(" -33.8568 151.2153 "), { lat: -33.8568, lng: 151.2153 });
same(geo.parseCoordinates("13.7563;100.5018"), { lat: 13.7563, lng: 100.5018 });
same(
  geo.parseCoordinates("https://www.google.com/maps/place/Taikoo+Li/@30.6545123,104.0832456,17z"),
  { lat: 30.654512, lng: 104.083246 },
);
same(
  geo.parseCoordinates("https://www.google.com/maps/search/?api=1&query=35.6586%2C139.7454"),
  { lat: 35.6586, lng: 139.7454 },
);
same(
  geo.parseCoordinates("https://www.google.com/maps/place/X/data=!3d18.7883!4d98.9853"),
  { lat: 18.7883, lng: 98.9853 },
);
same(
  geo.parseCoordinates("https://www.openstreetmap.org/#map=17/19.8856/102.1347"),
  { lat: 19.8856, lng: 102.1347 },
);
same(
  geo.parseCoordinates("https://www.openstreetmap.org/?mlat=19.8856&mlon=102.1347"),
  { lat: 19.8856, lng: 102.1347 },
);
assert.equal(geo.parseCoordinates("91, 10"), null);
assert.equal(geo.parseCoordinates("10, 181"), null);
assert.equal(geo.parseCoordinates("Taikoo Li"), null);
assert.equal(geo.parseCoordinates(""), null);
assert.equal(geo.parseCoordinates("%E0%A4%A, 1"), null);
assert.equal(geo.formatCoordinates({ lat: 30.12345678, lng: -0.1 }), "30.123457, -0.1");
assert.ok(Math.abs(geo.distanceKm({ lat: 0, lng: 0 }, { lat: 1, lng: 0 }) - 111.195) < 0.01);
assert.ok(Math.abs(geo.distanceKm({ lat: 10, lng: 179.5 }, { lat: 10, lng: -179.5 }) - 109.5) < 0.5);
assert.equal(geo.routeKm([]), 0);
assert.equal(geo.routeKm([{ lat: 1, lng: 1 }]), 0);
const leg = { lat: 0, lng: 0 }, leg2 = { lat: 1, lng: 0 };
assert.ok(Math.abs(geo.routeKm([leg, leg2, leg]) - 2 * geo.distanceKm(leg, leg2)) < 1e-9);
assert.equal(geo.km(0.4321), "432 m");
assert.equal(geo.km(1234.56), "1,234.6 km");
assert.equal(geo.located({ ...t.stops[0], lat: 1, lng: 2 }), true);
assert.equal(geo.located(t.stops[0]), false);
assert.equal(geo.located({ ...t.stops[0], lat: 1 }), false);
assert.equal(geo.dayColor(0), "#7b8ca2");
assert.equal(geo.dayColor(1), geo.dayColor(9));
// v0.4 storage: coordinate validation
const pinned = { ...t, stops: [{ ...t.stops[0], lat: 30.65, lng: 104.08 }] };
assert.equal(storage.validateTrips([pinned]), true);
assert.equal(storage.validateTrips([{ ...t, stops: [{ ...t.stops[0], lat: 30.65 }] }]), false);
assert.equal(storage.validateTrips([{ ...t, stops: [{ ...t.stops[0], lat: 95, lng: 0 }] }]), false);
assert.equal(storage.validateTrips([{ ...t, stops: [{ ...t.stops[0], lat: "30", lng: "104" }] }]), false);
// v0.4 storage: v0.3 -> v0.4 migration keeps v0.3 untouched and copies a backup
data.clear();
const v03 = JSON.stringify([t]);
store.setItem(storage.PREVIOUS, v03);
store.setItem(storage.LEGACY, JSON.stringify([]));
assert.equal(storage.KEY, "tripflow-v04");
const migrated = storage.loadTrips();
assert.equal(migrated.error, "");
assert.equal(migrated.trips[0].stops[0].title, "Last day");
assert.equal(store.getItem("tripflow-v03-backup"), v03);
assert.equal(store.getItem(storage.PREVIOUS), v03);
assert.equal(store.getItem(storage.KEY), null, "loading never writes the new key");
// v0.4 key wins over older keys once present
store.setItem(storage.KEY, JSON.stringify([pinned]));
assert.equal(storage.loadTrips().trips[0].stops[0].lat, 30.65);
// v0.2-only workspace still migrates
data.clear();
store.setItem(storage.LEGACY, v03);
assert.equal(storage.loadTrips().trips.length, 1);
assert.equal(store.getItem("tripflow-v02-backup"), v03);
// corrupt v0.3 data is reported, not replaced by the seed
data.clear();
store.setItem(storage.PREVIOUS, "{oops");
assert.ok(storage.loadTrips().error);
assert.equal(storage.loadTrips().trips.length, 0);
assert.equal(store.getItem(storage.PREVIOUS), "{oops");
// test fixture (used by the browser tests) stays valid and has pinned places across more than one day
const { seedTrips } = moduleAt("./tests/fixtures/demo-trips.ts");
assert.equal(storage.validateTrips(seedTrips), true);
const chengdu = seedTrips.find((x) => x.id === "chengdu");
assert.ok(new Set(chengdu.stops.filter(geo.located).map((s) => s.day)).size >= 2);
assert.ok(chengdu.stops.some((s) => !geo.located(s)), "demo shows an unpinned activity");
// Forms: day/month/year dates and 24-hour times
assert.equal(dates.parseDateInput("26/12/2026"), "2026-12-26");
assert.equal(dates.parseDateInput("6/1/2027"), "2027-01-06");
assert.equal(dates.parseDateInput("26-12-2026"), "2026-12-26");
assert.equal(dates.parseDateInput("26122026"), "2026-12-26");
assert.equal(dates.parseDateInput("26/12/2569"), "2026-12-26", "Buddhist-era year");
assert.equal(dates.parseDateInput("31/02/2026"), null);
assert.equal(dates.parseDateInput("12/26/2026"), null, "month/day order rejected");
assert.equal(dates.parseDateInput(""), null);
assert.equal(dates.formatDateInput("2026-12-26"), "26/12/2026");
assert.equal(dates.formatDateInput(""), "");
assert.equal(dates.longDate("2026-12-26"), "Sat, 26 Dec 2026");
for (const [input, out] of [
  ["13:00", "13:00"], ["1300", "13:00"], ["13.30", "13:30"], ["9", "09:00"],
  ["930", "09:30"], ["0930", "09:30"], ["1pm", "13:00"], ["1:30 PM", "13:30"],
  ["12am", "00:00"], ["12pm", "12:00"], ["19.00 น.", "19:00"], ["", ""],
  ["24:00", null], ["13pm", null], ["9:75", null], ["noon", null],
])
  assert.equal(dates.parseTime(input), out, input);
// Destination data: Thai/English city search, country lookup, flags
const places = moduleAt("./src/data/places.ts");
assert.equal(places.findCities("chiang")[0].en, "Chiang Mai");
assert.equal(places.findCities("เกียว")[0].en, "Kyoto");
assert.equal(places.findCities("เชียงใหม่")[0].code, "TH");
assert.equal(places.findCities("hoi an")[0].en, "Hoi An");
assert.equal(places.findCities("zzzz").length, 0);
assert.equal(places.cityByName("Chengdu").code, "CN");
assert.equal(places.countryByName("Laos").code, "LA");
assert.equal(places.countryByName("ญี่ปุ่น").code, "JP");
assert.equal(places.countryByName("China").en, "China");
assert.equal(places.findCountries("thai")[0].code, "TH");
assert.ok(places.countries().length > 240);
assert.ok(places.CITIES.every((c) => geo.validCoordinate(c.lat, c.lng) && places.countryByCode(c.code)));
assert.equal(new Set(places.CITIES.map((c) => c.en + c.code)).size, places.CITIES.length);
for (const t of seedTrips) assert.ok(places.countryByName(t.country), t.country);
// Place search: merging, de-duplication, distance ordering, trip center
const search = moduleAt("./src/lib/search.ts", { "../data/places": places, "./geo": geo });
const cm = { lat: 18.7883, lng: 98.9853 };
const r = (name, lat, lng, source = "photon") => ({ name, lat, lng, area: "", kind: "", source });
const merged = search.mergeResults(
  [[r("Tha Phae Gate", 18.7877, 98.9933), r("Far Gate", 13.75, 100.5)],
   [r("tha phae gate", 18.7878, 98.9934, "nominatim"), r("Old City", 18.79, 98.99, "nominatim")]],
  cm,
);
assert.deepEqual([...merged.map((x) => x.name)], ["Tha Phae Gate", "Old City", "Far Gate"]);
assert.ok(merged[0].km < 1 && merged[2].km > 500);
assert.equal(search.mergeResults([[r("A", 1, 1)], [r("A", 5, 5)]]).length, 2, "same name far apart kept");
assert.deepEqual({ ...search.tripCenter({ ...t, city: "Chiang Mai", stops: [] }) }, { lat: 18.7883, lng: 98.9853 });
assert.deepEqual({ ...search.tripCenter({ ...t, city: "X", lat: 1, lng: 2, stops: [] }) }, { lat: 1, lng: 2 });
assert.deepEqual({ ...search.tripCenter({ ...t, city: "Nowhere", stops: [{ ...t.stops[0], lat: 10, lng: 20 }, { ...t.stops[0], id: "z", lat: 20, lng: 40 }] }) }, { lat: 15, lng: 30 });
assert.equal(search.tripCenter({ ...t, city: "Nowhere" }), null);
assert.equal(search.isShortMapLink("https://maps.app.goo.gl/abc123"), true);
assert.equal(search.isShortMapLink("https://www.google.com/maps/@1,2,3z"), false);
// Trip destination fields
assert.equal(storage.validateTrips([{ ...t, countryCode: "TH", lat: 18.79, lng: 98.98 }]), true);
assert.equal(storage.validateTrips([{ ...t, countryCode: "th" }]), false);
assert.equal(storage.validateTrips([{ ...t, lat: 18.79 }]), false);
console.log(
  "PASS: date boundaries, status, rescheduling, migration, corrupt data, validation, coordinates, distances, v0.3 -> v0.4 migration, date/time input, destinations and place search",
);
