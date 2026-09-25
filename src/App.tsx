import { useEffect, useState } from "react";
import Sidebar from "./components/Sidebar";
import Dashboard from "./pages/Dashboard";
import TripPage from "./pages/TripPage";
import { seedTrips } from "./data/demo";
import type { Trip } from "./types";
import { FeedbackProvider, useFeedback } from "./components/UI";
import { KEY, loadTrips } from "./lib/storage";
export default function App() {
  return (
    <FeedbackProvider>
      <Workspace />
    </FeedbackProvider>
  );
}
function Workspace() {
  const [loaded] = useState(() => loadTrips(seedTrips));
  const [trips, setTrips] = useState(loaded.trips);
  const [selected, setSelected] = useState<string | null>(null);
  const [section, setSection] = useState("Home");
  const [storageError, setStorageError] = useState(loaded.error);
  const { notify } = useFeedback();
  const [clock, setClock] = useState(Date.now());
  useEffect(() => {
    const timer = setInterval(() => setClock(Date.now()), 30000);
    return () => clearInterval(timer);
  }, []);
  useEffect(() => {
    if (loaded.error) return;
    try {
      localStorage.setItem(KEY, JSON.stringify(trips));
      setStorageError("");
    } catch {
      setStorageError(
        "Changes are only in memory: browser storage is unavailable or full. Export a backup in Settings before closing this page.",
      );
    }
  }, [trips, loaded]);
  const update = (next: Trip) => {
    setTrips((current) => current.map((t) => (t.id === next.id ? next : t)));
    if (next.notes === trips.find((t) => t.id === next.id)?.notes)
      notify("Changes saved in this session");
  };
  const trip = trips.find((t) => t.id === selected);
  return (
    <>
      <div className="sr-only" aria-hidden="true">
        {clock}
      </div>
      {storageError && (
        <div className="storage-warning" role="alert">
          {storageError}{" "}
          <button
            onClick={() => {
              setSelected(null);
              setSection("Settings");
            }}
          >
            Open Settings
          </button>
        </div>
      )}
      {trip ? (
        <TripPage
          key={trip.id}
          trip={trip}
          update={update}
          back={() => setSelected(null)}
          initialTab={
            section === "Packing List"
              ? "Packing"
              : section === "Budget"
                ? "Budget"
                : section === "Places"
                  ? "Map"
                  : "Overview"
          }
        />
      ) : (
        <div className="app">
          <Sidebar
            section={section}
            setSection={setSection}
            onNew={() => setSection("New Trip")}
          />
          <Dashboard
            trips={trips}
            setTrips={setTrips}
            openTrip={setSelected}
            section={section}
            setSection={setSection}
          />
        </div>
      )}
    </>
  );
}
