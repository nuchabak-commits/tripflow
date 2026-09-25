import { useState } from "react";
import {
  Search,
  ArrowRight,
  Plus,
  CalendarDays,
  WalletCards,
  Luggage,
  MapPin,
  Download,
} from "lucide-react";
import TripCard from "../components/TripCard";
import TripForm from "../components/TripForm";
import type { Trip } from "../types";
import { useFeedback } from "../components/UI";
import {
  status,
  today,
  dayCount,
  dateLabel,
  money,
  coverStyle,
  dateNumber,
} from "../lib/trips";
import { KEY, LEGACY } from "../lib/storage";
export default function Dashboard({
  trips,
  setTrips,
  openTrip,
  section,
  setSection,
}: {
  trips: Trip[];
  setTrips: (x: Trip[]) => void;
  openTrip: (id: string) => void;
  section: string;
  setSection: (s: string) => void;
}) {
  const [q, setQ] = useState("");
  const [filter, setFilter] = useState("All");
  const [editing, setEditing] = useState<Trip>();
  const { notify, confirm } = useFeedback();
  const filtered = trips.filter(
    (t) =>
      (t.city + " " + t.country + " " + t.stops.map((s) => s.title).join(" "))
        .toLowerCase()
        .includes(q.toLowerCase()) &&
      (filter === "All" ||
        (filter === "Favorites" && t.favorite) ||
        status(t) === filter),
  );
  const active = trips
    .filter((t) => status(t) !== "Past")
    .sort((a, b) => a.startDate.localeCompare(b.startDate));
  const featured = active[0];
  const greeting =
    new Date().getHours() < 12
      ? "Good morning"
      : new Date().getHours() < 18
        ? "Good afternoon"
        : "Good evening";
  return (
    <main className="content">
      <header className="topbar">
        <div className="search">
          <Search size={17} />
          <input
            aria-label="Search trips"
            value={q}
            onChange={(e) => {
              setQ(e.target.value);
              if (!["Home", "My Trips"].includes(section))
                setSection("My Trips");
            }}
            placeholder="Search trips and places…"
          />
        </div>
        <span className="version">v0.3</span>
        <div className="avatar" aria-label="Local workspace">
          TF
        </div>
      </header>
      {["Home", "My Trips", "New Trip"].includes(section) ? (
        <>
          <section className="welcome">
            <span className="eyebrow">
              A LITTLE PLANNING. A LOT OF ADVENTURE.
            </span>
            <h1>
              {section === "My Trips"
                ? "Your travel collection"
                : `${greeting} ☀️`}
              <br />
              {section === "My Trips"
                ? "Every journey starts here."
                : "Where are we going next?"}
            </h1>
            <p>Your days, your budget, your adventures. All in one place.</p>
          </section>
          {section !== "My Trips" && (
            <section className="featured-grid">
              {featured ? (
                <div
                  className={"featured " + featured.gradient}
                  style={coverStyle(featured)}
                >
                  <div className="featured-copy">
                    <span className="eyebrow">
                      {status(featured) === "Ongoing"
                        ? "YOUR ADVENTURE IS HAPPENING"
                        : "YOUR NEXT ADVENTURE"}
                    </span>
                    <h2>{featured.city}</h2>
                    <p>
                      {featured.country} ·{" "}
                      {status(featured) === "Ongoing"
                        ? "Traveling now"
                        : `${Math.round((dateNumber(featured.startDate) - dateNumber(today())) / 86400000)} days to go`}
                    </p>
                    <div className="meta">
                      {dateLabel(featured.startDate)} –{" "}
                      {dateLabel(featured.endDate)}
                      <br />
                      {dayCount(featured)} days · ฿{money(featured.budget)}{" "}
                      budget
                    </div>
                    <button onClick={() => openTrip(featured.id)}>
                      Explore trip <ArrowRight size={17} />
                    </button>
                  </div>
                  <div className="panda">{featured.emoji}</div>
                </div>
              ) : (
                <div className="featured hero-blue">
                  <h2>Your next chapter awaits</h2>
                  <p>Create a trip and start collecting moments.</p>
                  <button onClick={() => setSection("New Trip")}>
                    Plan a new trip <Plus size={17} />
                  </button>
                </div>
              )}
              <div className="upcoming">
                <h3>Your travel snapshot</h3>
                <div className="stat-row">
                  <CalendarDays />
                  <span>
                    <b>{active.length}</b> upcoming / ongoing trips
                  </span>
                </div>
                <div className="stat-row">
                  <WalletCards />
                  <span>
                    <b>
                      ฿
                      {money(
                        trips.reduce(
                          (a, t) =>
                            a + t.expenses.reduce((n, e) => n + e.amount, 0),
                          0,
                        ),
                      )}
                    </b>{" "}
                    total recorded expenses
                  </span>
                </div>
                <div className="stat-row">
                  <Luggage />
                  <span>
                    <b>
                      {trips.reduce(
                        (a, t) => a + t.packing.filter((p) => p.packed).length,
                        0,
                      )}
                    </b>{" "}
                    items packed
                  </span>
                </div>
                <div className="stat-row">
                  <MapPin />
                  <span>
                    <b>{trips.reduce((a, t) => a + t.stops.length, 0)}</b>{" "}
                    activities planned
                  </span>
                </div>
              </div>
            </section>
          )}
          <div className="section-title">
            <div>
              <h2>
                My trips <span className="count">{trips.length}</span>
              </h2>
              <div className="chips">
                {["All", "Upcoming", "Ongoing", "Past", "Favorites"].map(
                  (x) => (
                    <button
                      key={x}
                      className={filter === x ? "selected" : ""}
                      onClick={() => setFilter(x)}
                    >
                      {x}
                    </button>
                  ),
                )}
              </div>
            </div>
            <button className="primary" onClick={() => setSection("New Trip")}>
              <Plus size={16} /> New trip
            </button>
          </div>
          {filtered.length === 0 && (
            <div className="mini-empty">
              {trips.length
                ? "No trips match this search or filter."
                : "Your travel collection is empty. Create your first trip below."}
            </div>
          )}
          <section className="trip-grid">
            {filtered.map((t) => (
              <TripCard
                key={t.id}
                trip={t}
                onOpen={() => openTrip(t.id)}
                onEdit={() => setEditing(t)}
                onFavorite={() => {
                  setTrips(
                    trips.map((x) =>
                      x.id === t.id ? { ...x, favorite: !x.favorite } : x,
                    ),
                  );
                  notify(
                    t.favorite
                      ? "Removed from favorites"
                      : "Added to favorites",
                  );
                }}
                onDelete={async () => {
                  if (
                    await confirm(
                      "Delete trip?",
                      `${t.city}, its itinerary, expenses, packing and notes will be removed.`,
                    )
                  ) {
                    setTrips(trips.filter((x) => x.id !== t.id));
                    notify("Trip deleted");
                  }
                }}
              />
            ))}
            <button className="add-card" onClick={() => setSection("New Trip")}>
              <Plus />
              Start a new adventure
            </button>
          </section>
        </>
      ) : (
        <Summary
          section={section}
          trips={trips}
          openTrip={openTrip}
          reset={() => setTrips([])}
        />
      )}{" "}
      {(section === "New Trip" || editing) && (
        <TripForm
          trip={editing}
          close={() => {
            setEditing(undefined);
            if (section === "New Trip") setSection("Home");
          }}
          save={(t) => {
            setTrips(
              editing
                ? trips.map((x) => (x.id === t.id ? t : x))
                : [...trips, t],
            );
            notify(editing ? "Trip updated" : "Trip created");
            setEditing(undefined);
            if (section === "New Trip") {
              setSection("Home");
              openTrip(t.id);
            }
          }}
        />
      )}
    </main>
  );
}
function Summary({
  section,
  trips,
  openTrip,
  reset,
}: {
  section: string;
  trips: Trip[];
  openTrip: (id: string) => void;
  reset: () => void;
}) {
  const { confirm, notify } = useFeedback();
  function download(raw = false) {
    try {
      const data = raw
        ? (localStorage.getItem(KEY) ?? localStorage.getItem(LEGACY) ?? "[]")
        : JSON.stringify(trips, null, 2);
      const url = URL.createObjectURL(
        new Blob([data], { type: "application/json" }),
      );
      const a = document.createElement("a");
      a.href = url;
      a.download = `tripflow-${raw ? "saved-data" : "backup"}-${today()}.json`;
      a.click();
      setTimeout(() => URL.revokeObjectURL(url), 1000);
    } catch {
      notify("Browser storage cannot be read.", true);
    }
  }
  if (section === "Settings")
    return (
      <section className="simple-page">
        <span className="eyebrow">YOUR WORKSPACE</span>
        <h1>Settings</h1>
        <p>
          TripFlow v0.3 · Data stays in this browser. Use the same address and
          port to retain access to v0.2 data.
        </p>
        <div className="settings-actions">
          <button className="primary" onClick={() => download()}>
            <Download size={16} /> Export current trips
          </button>
          <button className="secondary" onClick={() => download(true)}>
            Export original saved data
          </button>
        </div>
        <p>
          v0.2 data is copied to v0.3 on first launch. Its original key and
          migration backup remain untouched. JSON restore is planned for a later
          version.
        </p>
        <button
          className="danger"
          onClick={async () => {
            if (
              await confirm(
                "Delete all v0.3 trips?",
                "This empties your v0.3 workspace. Export a backup first. Your v0.2 data is retained.",
              )
            ) {
              reset();
              notify("v0.3 workspace cleared");
            }
          }}
        >
          Delete all v0.3 trips
        </button>
      </section>
    );
  const sorted =
    section === "Calendar"
      ? [...trips].sort((a, b) => a.startDate.localeCompare(b.startDate))
      : trips;
  return (
    <section className="simple-page">
      <span className="eyebrow">ACROSS YOUR JOURNEYS</span>
      <h1>{section === "Calendar" ? "Travel calendar · agenda" : section}</h1>
      <p>
        Choose a trip to manage its{" "}
        {section === "Calendar" ? "plans" : section.toLowerCase()}.
      </p>
      {!trips.length && (
        <div className="mini-empty">Create a trip to get started.</div>
      )}
      <div className="summary-list">
        {sorted.map((t) => (
          <button key={t.id} onClick={() => openTrip(t.id)}>
            <span className={"summary-emoji " + t.gradient}>{t.emoji}</span>
            <span>
              <b>
                {t.city}, {t.country}
              </b>
              <small>
                {section === "Budget"
                  ? `฿${money(t.expenses.reduce((a, e) => a + e.amount, 0))} spent / ฿${money(t.budget)} budget`
                  : section === "Packing List"
                    ? `${t.packing.filter((x) => x.packed).length}/${t.packing.length} packed`
                    : section === "Places"
                      ? `${t.stops.length} activities`
                      : `${dateLabel(t.startDate)} – ${dateLabel(t.endDate)} · ${status(t)}`}
              </small>
            </span>
            <ArrowRight />
          </button>
        ))}
      </div>
    </section>
  );
}
