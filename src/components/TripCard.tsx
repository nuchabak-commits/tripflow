import type { Trip } from "../types";
import { Heart, Pencil, Trash2, ArrowUpRight } from "lucide-react";
import { status, dayCount, dateLabel, coverStyle } from "../lib/trips";
export default function TripCard({
  trip,
  onOpen,
  onDelete,
  onFavorite,
  onEdit,
}: {
  trip: Trip;
  onOpen: () => void;
  onDelete: () => void;
  onFavorite: () => void;
  onEdit: () => void;
}) {
  const state = status(trip);
  return (
    <article className="trip-card">
      <button
        aria-label={"Open " + trip.city}
        className={"trip-cover " + trip.gradient}
        style={coverStyle(trip)}
        onClick={onOpen}
      >
        <span>{trip.emoji}</span>
        <small className={state.toLowerCase()}>{state}</small>
      </button>
      <div className="trip-info">
        <button className="trip-info-link" onClick={onOpen}>
          <b>
            {trip.city}
            <ArrowUpRight size={16} />
          </b>
          <p>
            {dateLabel(trip.startDate)} – {dateLabel(trip.endDate)}
          </p>
          <span>
            {dayCount(trip)} days · {dayCount(trip) - 1} nights · {trip.country}
          </span>
        </button>
      </div>
      <div className="card-footer">
        <button
          title="Favorite"
          aria-label={"Favorite " + trip.city}
          aria-pressed={trip.favorite}
          onClick={onFavorite}
        >
          <Heart size={16} fill={trip.favorite ? "currentColor" : "none"} />
        </button>
        <button aria-label={"Edit " + trip.city} onClick={onEdit}>
          <Pencil size={14} /> Edit
        </button>
        <button aria-label={"Delete " + trip.city} onClick={onDelete}>
          <Trash2 size={14} />
        </button>
      </div>
    </article>
  );
}
