import { useState } from "react";
import {
  ArrowLeft,
  Plane,
  Hotel,
  MapPin,
  Camera,
  Utensils,
  GripVertical,
  Plus,
  Trash2,
  Check,
  WalletCards,
  Luggage,
  Pencil,
  ArrowRight,
  ArrowUp,
  ArrowDown,
  CalendarDays,
  FileText,
} from "lucide-react";
import {
  DndContext,
  closestCenter,
  PointerSensor,
  KeyboardSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
  sortableKeyboardCoordinates,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import type { Trip, Stop, StopKind, Expense } from "../types";
import { Modal, useFeedback } from "../components/UI";
import TripForm from "../components/TripForm";
import {
  dayCount,
  dateAt,
  dateLabel,
  money,
  coverStyle,
  status,
} from "../lib/trips";
const icons = {
  flight: Plane,
  hotel: Hotel,
  place: MapPin,
  photo: Camera,
  food: Utensils,
};
const names = {
  flight: "Flight",
  hotel: "Hotel",
  place: "Place",
  photo: "Photo spot",
  food: "Food & drink",
};
function SortableStop({
  s,
  onDelete,
  onEdit,
  move,
  first,
  last,
}: {
  s: Stop;
  onDelete: () => void;
  onEdit: () => void;
  move: (offset: number) => void;
  first: boolean;
  last: boolean;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: s.id });
  const Icon = icons[s.kind];
  return (
    <div
      ref={setNodeRef}
      style={{
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.6 : 1,
      }}
      className="stop"
    >
      <time>{s.time || "—"}</time>
      <div className={"stop-icon " + s.kind}>
        <Icon size={17} />
      </div>
      <div className="stop-copy">
        <span className="stop-kind">{names[s.kind]}</span>
        <b>{s.title}</b>
        <p>{s.note}</p>
        <small>{s.duration}</small>
      </div>
      <div className="stop-actions">
        <button
          className="icon-btn"
          aria-label={"Edit " + s.title}
          onClick={onEdit}
        >
          <Pencil size={16} />
        </button>
        <button
          className="icon-btn"
          aria-label={"Delete " + s.title}
          onClick={onDelete}
        >
          <Trash2 size={16} />
        </button>
        <button
          className="icon-btn"
          aria-label={"Move up " + s.title}
          disabled={first}
          onClick={() => move(-1)}
        >
          <ArrowUp size={16} />
        </button>
        <button
          className="icon-btn"
          aria-label={"Move down " + s.title}
          disabled={last}
          onClick={() => move(1)}
        >
          <ArrowDown size={16} />
        </button>
        <button
          className="drag"
          {...attributes}
          {...listeners}
          aria-label={"Drag " + s.title}
        >
          <GripVertical size={18} />
        </button>
      </div>
    </div>
  );
}
export default function TripPage({
  trip,
  update,
  back,
  initialTab = "Overview",
}: {
  trip: Trip;
  update: (t: Trip) => void;
  back: () => void;
  initialTab?: string;
}) {
  const [tab, setTab] = useState(initialTab);
  const [day, setDay] = useState(1);
  const [editingTrip, setEditingTrip] = useState(false);
  const [stopEdit, setStopEdit] = useState<Stop | null | undefined>();
  const { confirm } = useFeedback();
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );
  const days = dayCount(trip);
  const stops = trip.stops.filter((s) => s.day === day);
  const tabs = ["Overview", "Itinerary", "Budget", "Packing", "Notes"];
  const setStops = (next: Stop[]) =>
    update({
      ...trip,
      stops: [...trip.stops.filter((s) => s.day !== day), ...next],
    });
  return (
    <main className="trip-page">
      <header className={"trip-hero " + trip.gradient} style={coverStyle(trip)}>
        <div className="hero-toolbar">
          <button className="back" onClick={back}>
            <ArrowLeft size={17} /> All trips
          </button>
          <button className="back" onClick={() => setEditingTrip(true)}>
            <Pencil size={15} /> Edit trip
          </button>
        </div>
        <div className="trip-heading">
          <span className="eyebrow">
            {status(trip)} · {trip.country}
          </span>
          <h1>{trip.city}</h1>
          <p>
            {dateLabel(trip.startDate)} – {dateLabel(trip.endDate)} · {days}{" "}
            days / {days - 1} nights
          </p>
        </div>
        <div className="panda big">{trip.emoji}</div>
      </header>
      <nav className="tabs" aria-label="Trip sections">
        {tabs.map((t) => (
          <button
            key={t}
            className={tab === t ? "on" : ""}
            onClick={() => setTab(t)}
          >
            {t}
          </button>
        ))}
      </nav>
      {tab === "Overview" && (
        <Overview
          trip={trip}
          setTab={setTab}
          edit={() => setEditingTrip(true)}
        />
      )}
      {tab === "Itinerary" && (
        <section className="planner">
          <aside className="days">
            {Array.from({ length: days }, (_, i) => i + 1).map((d) => (
              <button
                className={d === day ? "selected" : ""}
                onClick={() => setDay(d)}
                key={d}
              >
                <b>Day {d}</b>
                <span>
                  {dateLabel(dateAt(trip.startDate, d - 1)).replace(
                    / \d{4}$/,
                    "",
                  )}
                </span>
                <small>
                  {trip.stops.filter((s) => s.day === d).length} activities
                </small>
              </button>
            ))}
            {trip.stops.some((s) => s.day === 0) && (
              <button
                className={day === 0 ? "selected" : ""}
                onClick={() => setDay(0)}
              >
                Unscheduled<span>Assign a day</span>
              </button>
            )}
          </aside>
          <div className="timeline">
            <div className="planner-head">
              <div>
                <span className="eyebrow">MAKE ROOM FOR MEMORIES</span>
                <h2>{day === 0 ? "Unscheduled" : `Day ${day}`}</h2>
                <p>{stops.length} activities · drag or use arrows to reorder</p>
              </div>
              <button className="primary" onClick={() => setStopEdit(null)}>
                <Plus size={16} /> Add Place
              </button>
            </div>
            {!stops.length && (
              <div className="mini-empty">
                <MapPin size={30} />
                <h3>A day full of possibility</h3>
                <p>Add your first activity to start planning.</p>
              </div>
            )}
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={(e) => {
                if (e.over && e.active.id !== e.over.id) {
                  const a = stops.findIndex((x) => x.id === e.active.id),
                    b = stops.findIndex((x) => x.id === e.over?.id);
                  if (a >= 0 && b >= 0) setStops(arrayMove(stops, a, b));
                }
              }}
            >
              <SortableContext
                items={stops.map((s) => s.id)}
                strategy={verticalListSortingStrategy}
              >
                {stops.map((s, i) => (
                  <SortableStop
                    key={s.id}
                    s={s}
                    first={i === 0}
                    last={i === stops.length - 1}
                    move={(n) => setStops(arrayMove(stops, i, i + n))}
                    onEdit={() => setStopEdit(s)}
                    onDelete={async () => {
                      if (
                        await confirm(
                          "Delete activity?",
                          `Remove “${s.title}” from this itinerary?`,
                        )
                      )
                        setStops(stops.filter((x) => x.id !== s.id));
                    }}
                  />
                ))}
              </SortableContext>
            </DndContext>
          </div>
          <aside className="map-card">
            <span className="eyebrow">THE DAY AT A GLANCE</span>
            <h3>{day === 0 ? "Activities to schedule" : "Your daily route"}</h3>
            {stops.map((s, i) => (
              <div className="place-row" key={s.id}>
                <span>{i + 1}</span>
                <b>{s.title}</b>
                <time>{s.time}</time>
              </div>
            ))}
            <p className="muted">
              {stops.length
                ? "Activity order only."
                : "Add activities to see your day here."}{" "}
              Interactive maps are planned for v0.4.
            </p>
          </aside>
        </section>
      )}
      {tab === "Budget" && (
        <Budget
          trip={trip}
          update={update}
          editTrip={() => setEditingTrip(true)}
        />
      )}{" "}
      {tab === "Packing" && <Packing trip={trip} update={update} />}{" "}
      {tab === "Notes" && <Notes trip={trip} update={update} />}{" "}
      {stopEdit !== undefined && (
        <StopForm
          days={days}
          day={day}
          stop={stopEdit}
          close={() => setStopEdit(undefined)}
          save={(s) => {
            update({
              ...trip,
              stops: trip.stops.some((x) => x.id === s.id)
                ? trip.stops.map((x) => (x.id === s.id ? s : x))
                : [...trip.stops, s],
            });
            setDay(s.day);
            setStopEdit(undefined);
          }}
        />
      )}
      {editingTrip && (
        <TripForm
          trip={trip}
          close={() => setEditingTrip(false)}
          save={(t) => {
            update(t);
            setDay((d) => Math.min(d, dayCount(t)));
            setEditingTrip(false);
          }}
        />
      )}
    </main>
  );
}
function Overview({
  trip,
  setTab,
  edit,
}: {
  trip: Trip;
  setTab: (x: string) => void;
  edit: () => void;
}) {
  const spent = trip.expenses.reduce((a, e) => a + e.amount, 0),
    packed = trip.packing.filter((x) => x.packed).length,
    pct = trip.packing.length
      ? Math.round((packed / trip.packing.length) * 100)
      : 0;
  const unscheduled = trip.stops.filter((s) => s.day === 0).length;
  return (
    <>
      <section className="overview-grid">
        <button onClick={() => setTab("Itinerary")}>
          <CalendarDays />
          <strong>{dayCount(trip)} days</strong>
          <span>
            {trip.stops.length} activities · {unscheduled} unscheduled
          </span>
          <div className="tile-link">
            Plan your days <ArrowRight size={14} />
          </div>
        </button>
        <button onClick={() => setTab("Budget")}>
          <WalletCards />
          <strong>฿{money(spent)}</strong>
          <span>
            {spent > trip.budget
              ? `฿${money(spent - trip.budget)} over budget`
              : `฿${money(trip.budget - spent)} remaining`}
          </span>
          <div className="progress">
            <i
              style={{
                width: `${Math.min(100, (spent / Math.max(trip.budget, 1)) * 100)}%`,
              }}
            />
          </div>
        </button>
        <button onClick={() => setTab("Packing")}>
          <Luggage />
          <strong>{pct}% packed</strong>
          <span>
            {packed} of {trip.packing.length} items ready
          </span>
          <div className="progress">
            <i style={{ width: `${pct}%` }} />
          </div>
        </button>
      </section>
      <section className="overview-details">
        <div className="panel">
          <div className="panel-title">
            <div>
              <MapPin />
              <h2>A glimpse of your journey</h2>
            </div>
            <button className="link" onClick={() => setTab("Itinerary")}>
              View itinerary <ArrowRight size={14} />
            </button>
          </div>
          {trip.stops.length ? (
            trip.stops.slice(0, 5).map((s) => (
              <div className="preview-stop" key={s.id}>
                <span>{s.day ? `Day ${s.day}` : "Unscheduled"}</span>
                <time>{s.time}</time>
                <b>{s.title}</b>
              </div>
            ))
          ) : (
            <div className="mini-empty">
              No activities yet. Start with a place you want to visit.
            </div>
          )}
        </div>
        <div className="panel overview-note">
          <div className="panel-title">
            <div>
              <FileText />
              <h2>Trip notes</h2>
            </div>
            <button className="link" onClick={() => setTab("Notes")}>
              Edit
            </button>
          </div>
          <p>
            {trip.notes ||
              "Save the little details that make your trip easier."}
          </p>
          <button className="secondary" onClick={edit}>
            <Pencil size={14} /> Edit trip details
          </button>
        </div>
      </section>
    </>
  );
}
function StopForm({
  days,
  day,
  stop,
  close,
  save,
}: {
  days: number;
  day: number;
  stop: Stop | null;
  close: () => void;
  save: (s: Stop) => void;
}) {
  const [f, setF] = useState<Stop>(
    stop || {
      id: crypto.randomUUID(),
      day,
      time: "09:00",
      title: "",
      note: "",
      duration: "1h",
      kind: "place",
    },
  );
  const [error, setError] = useState("");
  return (
    <Modal title={stop ? "Edit activity" : "Add activity"} close={close}>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (!f.title.trim()) return setError("Enter an activity name.");
          save({ ...f, title: f.title.trim(), note: f.note.trim() });
        }}
      >
        <h2>{stop ? "Edit" : "Add"} activity</h2>
        <div className="form-row">
          <label>
            Day
            <select
              aria-label="Day"
              value={f.day}
              onChange={(e) => setF({ ...f, day: +e.target.value })}
            >
              <option value={0}>Unscheduled</option>
              {Array.from({ length: days }, (_, i) => (
                <option key={i} value={i + 1}>
                  Day {i + 1}
                </option>
              ))}
            </select>
          </label>
          <label>
            Time
            <input
              required
              type="time"
              value={f.time}
              onChange={(e) => setF({ ...f, time: e.target.value })}
            />
          </label>
        </div>
        <label>
          Category
          <select
            value={f.kind}
            onChange={(e) => setF({ ...f, kind: e.target.value as StopKind })}
          >
            {Object.entries(names).map(([k, n]) => (
              <option key={k} value={k}>
                {n}
              </option>
            ))}
          </select>
        </label>
        <label>
          Place / activity
          <input
            required
            maxLength={150}
            value={f.title}
            onChange={(e) => setF({ ...f, title: e.target.value })}
            placeholder="Taikoo Li"
          />
        </label>
        <label>
          Notes
          <textarea
            rows={3}
            value={f.note}
            onChange={(e) => setF({ ...f, note: e.target.value })}
            placeholder="Address, transport or reminders"
          />
        </label>
        <label>
          Duration
          <input
            maxLength={50}
            value={f.duration}
            onChange={(e) => setF({ ...f, duration: e.target.value })}
            placeholder="2h 30m"
          />
        </label>
        {error && (
          <p className="form-error" role="alert">
            {error}
          </p>
        )}
        <button className="primary wide">Save activity</button>
      </form>
    </Modal>
  );
}
function Budget({
  trip,
  update,
  editTrip,
}: {
  trip: Trip;
  update: (t: Trip) => void;
  editTrip: () => void;
}) {
  const [editing, setEditing] = useState<Expense | null | undefined>();
  const { confirm } = useFeedback();
  const total = trip.expenses.reduce((a, b) => a + b.amount, 0);
  return (
    <section className="panel">
      <div className="panel-title">
        <div>
          <WalletCards />
          <h2>Trip budget</h2>
        </div>
        <button className="primary" onClick={() => setEditing(null)}>
          <Plus size={16} /> Add Expense
        </button>
      </div>
      <div className="budget-total">
        ฿{money(total)} <small>/ ฿{money(trip.budget)}</small>
      </div>
      <div className={"progress " + (total > trip.budget ? "over" : "")}>
        <i
          style={{
            width: `${Math.min((total / Math.max(trip.budget, 1)) * 100, 100)}%`,
          }}
        />
      </div>
      <div className="panel-title">
        <b>
          {total > trip.budget
            ? `฿${money(total - trip.budget)} over budget`
            : `฿${money(trip.budget - total)} remaining`}
        </b>
        <button className="link" onClick={editTrip}>
          Edit budget
        </button>
      </div>
      <div className="expense-list">
        {!trip.expenses.length && (
          <p className="mini-empty">
            No expenses yet. Record your first booking or purchase.
          </p>
        )}
        {trip.expenses.map((e) => (
          <div key={e.id}>
            <span>{e.category}</span>
            <b>{e.description}</b>
            <strong>฿{money(e.amount)}</strong>
            <button
              className="icon-btn"
              aria-label={"Edit expense " + e.description}
              onClick={() => setEditing(e)}
            >
              <Pencil size={16} />
            </button>
            <button
              className="icon-btn"
              aria-label={"Delete expense " + e.description}
              onClick={async () => {
                if (
                  await confirm(
                    "Delete expense?",
                    `Remove “${e.description}” (฿${money(e.amount)})?`,
                  )
                )
                  update({
                    ...trip,
                    expenses: trip.expenses.filter((x) => x.id !== e.id),
                  });
              }}
            >
              <Trash2 size={16} />
            </button>
          </div>
        ))}
      </div>
      {editing !== undefined && (
        <ExpenseForm
          expense={editing}
          close={() => setEditing(undefined)}
          save={(e) => {
            update({
              ...trip,
              expenses: trip.expenses.some((x) => x.id === e.id)
                ? trip.expenses.map((x) => (x.id === e.id ? e : x))
                : [...trip.expenses, e],
            });
            setEditing(undefined);
          }}
        />
      )}
    </section>
  );
}
function ExpenseForm({
  expense,
  close,
  save,
}: {
  expense: Expense | null;
  close: () => void;
  save: (e: Expense) => void;
}) {
  const [description, setDescription] = useState(expense?.description || "");
  const [category, setCategory] = useState(expense?.category || "Food");
  const [amount, setAmount] = useState(String(expense?.amount ?? ""));
  const [error, setError] = useState("");
  return (
    <Modal title="Expense" close={close}>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (
            !description.trim() ||
            !amount.trim() ||
            !Number.isFinite(+amount) ||
            +amount < 0
          )
            return setError("Enter a description and a non-negative amount.");
          save({
            id: expense?.id || crypto.randomUUID(),
            description: description.trim(),
            category,
            amount: +amount,
          });
        }}
      >
        <h2>{expense ? "Edit" : "Add"} expense</h2>
        <label>
          Category
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
          >
            {Array.from(
              new Set([
                category,
                "Flight",
                "Hotel",
                "Transport",
                "Food",
                "Shopping",
                "Activity",
                "Other",
              ]),
            ).map((x) => (
              <option key={x}>{x}</option>
            ))}
          </select>
        </label>
        <label>
          Description
          <input
            required
            maxLength={150}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </label>
        <label>
          Amount · THB
          <input
            required
            type="number"
            min="0"
            step="0.01"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
          />
        </label>
        {error && (
          <p className="form-error" role="alert">
            {error}
          </p>
        )}
        <button className="primary wide">Save expense</button>
      </form>
    </Modal>
  );
}
function Packing({ trip, update }: { trip: Trip; update: (t: Trip) => void }) {
  const [name, setName] = useState("");
  const { confirm } = useFeedback();
  const packed = trip.packing.filter((x) => x.packed).length;
  const pct = trip.packing.length
    ? Math.round((packed / trip.packing.length) * 100)
    : 0;
  return (
    <section className="panel">
      <div className="panel-title">
        <div>
          <Luggage />
          <h2>Packing list</h2>
        </div>
        <div className="circle">{pct}%</div>
      </div>
      <p className="muted">
        {packed} of {trip.packing.length} items packed
      </p>
      <div className="progress">
        <i style={{ width: `${pct}%` }} />
      </div>
      <form
        className="inline-add"
        onSubmit={(e) => {
          e.preventDefault();
          if (name.trim()) {
            update({
              ...trip,
              packing: [
                ...trip.packing,
                { id: crypto.randomUUID(), name: name.trim(), packed: false },
              ],
            });
            setName("");
          }
        }}
      >
        <input
          aria-label="Packing item"
          required
          maxLength={150}
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Passport, charger, favorite jacket…"
        />
        <button className="primary">
          <Plus size={16} /> Add
        </button>
      </form>
      {!trip.packing.length && (
        <p className="mini-empty">
          Your suitcase is a blank canvas. Add the essentials.
        </p>
      )}
      <div className="packing-grid">
        {trip.packing.map((x) => (
          <div className={"pack-row " + (x.packed ? "packed" : "")} key={x.id}>
            <button
              aria-pressed={x.packed}
              onClick={() =>
                update({
                  ...trip,
                  packing: trip.packing.map((p) =>
                    p.id === x.id ? { ...p, packed: !p.packed } : p,
                  ),
                })
              }
            >
              <span>{x.packed ? <Check size={15} /> : ""}</span>
              {x.name}
            </button>
            <button
              className="icon-btn"
              aria-label={"Delete packing " + x.name}
              onClick={async () => {
                if (
                  await confirm(
                    "Remove packing item?",
                    `Remove “${x.name}” from your list?`,
                  )
                )
                  update({
                    ...trip,
                    packing: trip.packing.filter((p) => p.id !== x.id),
                  });
              }}
            >
              <Trash2 size={16} />
            </button>
          </div>
        ))}
      </div>
    </section>
  );
}
function Notes({ trip, update }: { trip: Trip; update: (t: Trip) => void }) {
  return (
    <section className="panel">
      <h2>Trip notes</h2>
      <p className="muted">Saved automatically in this browser as you type.</p>
      <textarea
        aria-label="Trip notes"
        className="notes"
        value={trip.notes}
        onChange={(e) => update({ ...trip, notes: e.target.value })}
        placeholder="Ideas, addresses and reminders…"
      />
    </section>
  );
}
