import {
  Home,
  Map,
  CalendarDays,
  Luggage,
  WalletCards,
  MapPin,
  Settings,
  Plus,
} from "lucide-react";
const items = [
  ["Home", Home],
  ["My Trips", Map],
  ["Calendar", CalendarDays],
  ["Packing List", Luggage],
  ["Budget", WalletCards],
  ["Places", MapPin],
  ["Settings", Settings],
] as const;
export default function Sidebar({
  section,
  setSection,
  onNew,
}: {
  section: string;
  setSection: (x: string) => void;
  onNew: () => void;
}) {
  return (
    <aside className="sidebar">
      <div className="logo">
        🏔️ <b>TripFlow</b>
      </div>
      <nav>
        {items.map(([n, I]) => (
          <button
            key={n}
            className={section === n ? "active" : ""}
            onClick={() => setSection(n)}
          >
            <I size={18} />
            {n}
          </button>
        ))}
      </nav>
      <button className="new-trip" onClick={onNew}>
        <Plus size={18} /> New Trip
      </button>
    </aside>
  );
}
