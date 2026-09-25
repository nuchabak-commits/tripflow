const ts = require("typescript");
const fs = require("fs");
const vm = require("vm");
const assert = require("node:assert/strict");
function moduleAt(path, deps = {}) {
  const js = ts.transpileModule(fs.readFileSync(path, "utf8"), {
    compilerOptions: { module: ts.ModuleKind.CommonJS },
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
  };
  vm.runInNewContext(js, context);
  return exports;
}
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
assert.equal(storage.loadTrips([]).trips[0].stops[0].title, "Last day");
assert.equal(
  store.getItem("tripflow-v02-backup"),
  store.getItem(storage.LEGACY),
);
store.setItem(storage.KEY, "[]");
assert.equal(storage.loadTrips([t]).trips.length, 0);
store.setItem(storage.KEY, "broken");
assert.ok(storage.loadTrips([t]).error);
assert.equal(store.getItem(storage.KEY), "broken");
assert.equal(storage.validateTrips([{ ...t, budget: -1 }]), false);
assert.equal(storage.validateTrips([t, t]), false);
// v0.4 coordinates
const same = (a, b) => assert.deepEqual({ ...a }, b);
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
const migrated = storage.loadTrips([]);
assert.equal(migrated.error, "");
assert.equal(migrated.trips[0].stops[0].title, "Last day");
assert.equal(store.getItem("tripflow-v03-backup"), v03);
assert.equal(store.getItem(storage.PREVIOUS), v03);
assert.equal(store.getItem(storage.KEY), null, "loading never writes the new key");
// v0.4 key wins over older keys once present
store.setItem(storage.KEY, JSON.stringify([pinned]));
assert.equal(storage.loadTrips([]).trips[0].stops[0].lat, 30.65);
// v0.2-only workspace still migrates
data.clear();
store.setItem(storage.LEGACY, v03);
assert.equal(storage.loadTrips([]).trips.length, 1);
assert.equal(store.getItem("tripflow-v02-backup"), v03);
// corrupt v0.3 data is reported, not replaced by the seed
data.clear();
store.setItem(storage.PREVIOUS, "{oops");
assert.ok(storage.loadTrips([t]).error);
assert.equal(storage.loadTrips([t]).trips.length, 0);
assert.equal(store.getItem(storage.PREVIOUS), "{oops");
// demo seed stays valid and has pinned places across more than one day
const { seedTrips } = moduleAt("./src/data/demo.ts");
assert.equal(storage.validateTrips(seedTrips), true);
const chengdu = seedTrips.find((x) => x.id === "chengdu");
assert.ok(new Set(chengdu.stops.filter(geo.located).map((s) => s.day)).size >= 2);
assert.ok(chengdu.stops.some((s) => !geo.located(s)), "demo shows an unpinned activity");
console.log(
  "PASS: date boundaries, status, rescheduling, migration, corrupt data, validation, coordinates, distances and v0.3 -> v0.4 migration",
);
