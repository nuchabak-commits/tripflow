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
const storage = moduleAt("./src/lib/storage.ts", { "./trips": dates });
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
console.log(
  "PASS: date boundaries, status, rescheduling, migration, corrupt data and validation",
);
