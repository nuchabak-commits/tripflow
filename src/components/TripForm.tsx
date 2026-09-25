import { useEffect, useRef, useState } from "react";
import { MapPin, Globe2, Check } from "lucide-react";
import type { Trip } from "../types";
import { Modal } from "./UI";
import { Combobox, DateField, EmojiField, graphemes } from "./Fields";
import type { ComboOption } from "./Fields";
import {
  coverStyle,
  dateLabel,
  dayCount,
  money,
  reschedule,
  validDate,
} from "../lib/trips";
import {
  countryByCode,
  countryByName,
  findCities,
  findCountries,
  normalize,
} from "../data/places";
import { searchPhoton } from "../lib/search";
import { validCoordinate } from "../lib/geo";
export const GRADIENTS = [
  ["hero-blue", "Sky"],
  ["hero-teal", "Lagoon"],
  ["hero-green", "Forest"],
  ["hero-pink", "Sakura"],
  ["hero-sunset", "Sunset"],
  ["hero-purple", "Dusk"],
  ["hero-sand", "Desert"],
  ["hero-night", "Night"],
] as const;
type Dest = {
  city: string;
  country: string;
  countryCode?: string;
  lat?: number;
  lng?: number;
};
/** Country code badge; flag emoji do not render on Windows. */
const Code = ({ code }: { code?: string }) =>
  code ? <span className="code-badge">{code}</span> : <Globe2 size={16} />;
type CityPick = Dest & { online?: boolean; th?: string; area?: string };
function CityField({
  value,
  onChange,
}: {
  value: Dest;
  onChange: (d: Dest) => void;
}) {
  const [online, setOnline] = useState<CityPick[]>([]);
  const [loading, setLoading] = useState(false);
  const typed = useRef(false);
  const q = value.city.trim();
  useEffect(() => {
    if (!typed.current || q.length < 2) return setOnline([]);
    const ctl = new AbortController();
    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        const found = await searchPhoton(q, { places: true, signal: ctl.signal, limit: 6 });
        setOnline(
          found.map((r) => ({
            city: r.name,
            country: countryByCode(r.code)?.en || r.area.split(", ").pop() || "",
            countryCode: r.code,
            lat: r.lat,
            lng: r.lng,
            online: true,
            area: r.area,
          })),
        );
      } catch {
        setOnline([]);
      } finally {
        if (!ctl.signal.aborted) setLoading(false);
      }
    }, 450);
    return () => {
      clearTimeout(timer);
      ctl.abort();
    };
  }, [q]);
  const local: CityPick[] = findCities(q, 6).map((c) => ({
    city: c.en,
    country: countryByCode(c.code)?.en || c.code,
    countryCode: c.code,
    lat: c.lat,
    lng: c.lng,
    th: c.th,
  }));
  const seen = new Set(local.map((c) => normalize(c.city) + c.countryCode));
  const picks = [
    ...local,
    ...online.filter((c) => !seen.has(normalize(c.city) + c.countryCode)),
  ];
  const options: ComboOption<CityPick>[] = picks.map((c, i) => ({
    key: `${c.city}-${c.countryCode}-${i}`,
    value: c,
    icon: <Code code={c.countryCode} />,
    label: c.city,
    hint: [
      c.th,
      c.area || c.country,
      c.online ? "OpenStreetMap" : "",
    ]
      .filter(Boolean)
      .join(" · "),
  }));
  const exact = picks.some((c) => normalize(c.city) === normalize(q));
  return (
    <Combobox
      label="Destination"
      icon={<MapPin size={16} className="combo-lead" />}
      value={value.city}
      placeholder="Search a city — e.g. Chiang Mai, เกียวโต"
      maxLength={100}
      loading={loading && !options.length}
      onInput={(city) => {
        typed.current = true;
        onChange({ ...value, city, lat: undefined, lng: undefined });
      }}
      options={options}
      onPick={(o) =>
        onChange({
          city: o.value.city,
          country: o.value.country || value.country,
          countryCode: o.value.countryCode,
          lat: o.value.lat,
          lng: o.value.lng,
        })
      }
      footer={
        q && !exact ? (
          <span>
            Not listed? Keep typing — “{q}” is saved as you typed it; choose the
            country below.
          </span>
        ) : undefined
      }
    />
  );
}
function CountryField({
  value,
  onChange,
  invalid,
}: {
  value: Dest;
  onChange: (d: Dest) => void;
  invalid: boolean;
}) {
  // Draft text exists only while the user is typing; otherwise show the saved country.
  const [draft, setDraft] = useState<string | null>(null);
  const text = draft ?? value.country;
  const options: ComboOption<string>[] = findCountries(draft ?? "", 250).map(
    (c) => ({
      key: c.code,
      value: c.code,
      icon: <Code code={c.code} />,
      label: c.en,
      hint: c.th,
    }),
  );
  return (
    <Combobox
      label="Country"
      icon={
        <span className="combo-lead">
          <Code code={countryByName(text)?.code ?? value.countryCode} />
        </span>
      }
      value={text}
      placeholder="Select a country"
      openOnFocus
      invalid={invalid}
      onInput={(t) => {
        setDraft(t);
        const c = countryByName(t);
        onChange({ ...value, country: c ? c.en : t, countryCode: c?.code });
      }}
      onBlur={() => setDraft(null)}
      options={options}
      onPick={(o) => {
        const c = countryByCode(o.value)!;
        setDraft(null);
        onChange({ ...value, country: c.en, countryCode: c.code });
      }}
    />
  );
}
const budgetText = (n: string) => {
  const v = n.replace(/,/g, "");
  return v && Number.isFinite(+v) ? money(+v) : n;
};
export default function TripForm({
  trip,
  close,
  save,
}: {
  trip?: Trip;
  close: () => void;
  save: (t: Trip) => void;
}) {
  const known = trip ? countryByName(trip.country) : undefined;
  const [dest, setDest] = useState<Dest>({
    city: trip?.city || "",
    country: trip?.country || "",
    countryCode: trip?.countryCode || known?.code,
    lat: trip?.lat,
    lng: trip?.lng,
  });
  const [f, setF] = useState({
    startDate: trip?.startDate || "",
    endDate: trip?.endDate || "",
    budget: budgetText(String(trip?.budget ?? 30000)),
    coverUrl: trip?.coverUrl || "",
    emoji: trip?.emoji || "✈️",
    gradient: trip?.gradient || "hero-blue",
  });
  const [mode, setMode] = useState<"day" | "date">("day");
  const [approved, setApproved] = useState(false);
  const [error, setError] = useState("");
  const [tried, setTried] = useState(false);
  const change = (key: keyof typeof f, v: string) => {
    setF({ ...f, [key]: v });
    setApproved(false);
  };
  const dateOK =
    validDate(f.startDate) &&
    validDate(f.endDate) &&
    dayCount(f) >= 1 &&
    dayCount(f) <= 366;
  const changed =
    !!trip && (f.startDate !== trip.startDate || f.endDate !== trip.endDate);
  const stops =
    trip && dateOK
      ? reschedule(trip, f.startDate, f.endDate, mode)
      : trip?.stops || [];
  const displaced = stops.filter(
    (s, i) => s.day === 0 && trip?.stops[i].day !== 0,
  ).length;
  const country = countryByName(dest.country);
  const budget = f.budget.replace(/,/g, "").trim();
  const days = dateOK ? dayCount(f) : 0;
  return (
    <Modal close={close} title={trip ? "Edit trip" : "Create trip"}>
      <form
        className="trip-form"
        noValidate
        onSubmit={(e) => {
          e.preventDefault();
          setTried(true);
          if (!dest.city.trim()) return setError("Choose or type a destination.");
          if (!country) return setError("Select the country from the list.");
          if (!dateOK)
            return setError(
              "Choose valid dates (day/month/year) for a trip of 1–366 days. The end date must be on or after the start date.",
            );
          if (!budget || !Number.isFinite(+budget) || +budget < 0)
            return setError("Enter a budget of zero or more.");
          if (!f.emoji.trim() || graphemes(f.emoji) > 2)
            return setError("Pick an icon or type 1–2 characters.");
          if (f.coverUrl) {
            try {
              if (new URL(f.coverUrl).protocol !== "https:") throw 0;
            } catch {
              return setError("Use a valid HTTPS image URL.");
            }
          }
          if (displaced && !approved)
            return setError(
              "Please confirm moving affected activities to Unscheduled.",
            );
          const base: Trip = trip || {
            id: crypto.randomUUID(),
            city: "",
            country: "",
            startDate: "",
            endDate: "",
            budget: 0,
            emoji: "✈️",
            gradient: "hero-blue",
            favorite: false,
            stops: [],
            expenses: [],
            packing: [],
            notes: "",
          };
          const { countryCode: _c, lat: _la, lng: _ln, ...rest } = base;
          const center = validCoordinate(dest.lat, dest.lng)
            ? { lat: dest.lat as number, lng: dest.lng as number }
            : {};
          save({
            ...rest,
            ...f,
            ...center,
            city: dest.city.trim(),
            country: country.en,
            countryCode: country.code,
            coverUrl: f.coverUrl || undefined,
            emoji: f.emoji.trim(),
            budget: +budget,
            stops,
          });
        }}
      >
        <div>
          <span className="eyebrow">YOUR NEXT CHAPTER</span>
          <h2>{trip ? "Edit your trip" : "Where to next?"}</h2>
        </div>
        <div
          className={"cover-preview trip-preview " + f.gradient}
          style={
            f.coverUrl.startsWith("https://")
              ? coverStyle({ coverUrl: f.coverUrl } as Trip)
              : undefined
          }
          aria-label="Trip card preview"
        >
          <span className="preview-emoji" aria-hidden="true">
            {f.emoji || "✈️"}
          </span>
          <div>
            <small>
              {country?.en.toUpperCase() || "COUNTRY"}
            </small>
            <b>{dest.city.trim() || "Your destination"}</b>
            <span>
              {dateOK
                ? `${dateLabel(f.startDate)} – ${dateLabel(f.endDate)} · ${days} ${days === 1 ? "day" : "days"} / ${days - 1} ${days - 1 === 1 ? "night" : "nights"}`
                : "Pick your dates"}
              {budget && Number.isFinite(+budget) ? ` · ฿${money(+budget)}` : ""}
            </span>
          </div>
        </div>
        <div className="form-row">
          <CityField value={dest} onChange={setDest} />
          <CountryField value={dest} onChange={setDest} invalid={tried && !country} />
        </div>
        <div className="form-row">
          <DateField
            label="Start date"
            value={f.startDate}
            onChange={(v) => change("startDate", v)}
          />
          <DateField
            label="End date"
            value={f.endDate}
            min={f.startDate}
            onChange={(v) => change("endDate", v)}
          />
        </div>
        <label>
          Budget
          <div className="combo-input money-input">
            <span className="combo-lead">฿</span>
            <input
              inputMode="decimal"
              value={f.budget}
              onChange={(e) => change("budget", e.target.value.replace(/[^\d.,]/g, ""))}
              onBlur={() => change("budget", budgetText(f.budget))}
              placeholder="30,000"
            />
            <span className="combo-trail">THB</span>
          </div>
        </label>
        <EmojiField value={f.emoji} onChange={(v) => change("emoji", v)} />
        <fieldset className="swatch-field">
          <legend>Cover color</legend>
          <div className="swatches" role="radiogroup" aria-label="Cover color">
            {GRADIENTS.map(([cls, name]) => (
              <button
                type="button"
                key={cls}
                role="radio"
                aria-checked={f.gradient === cls}
                aria-label={name}
                title={name}
                className={cls + (f.gradient === cls ? " on" : "")}
                onClick={() => change("gradient", cls)}
              >
                {f.gradient === cls && <Check size={16} />}
              </button>
            ))}
          </div>
        </fieldset>
        <label>
          Cover image URL · optional
          <input
            type="url"
            value={f.coverUrl}
            onChange={(e) => change("coverUrl", e.target.value.trim())}
            placeholder="https://…/photo.jpg"
          />
          <small>
            Use a publicly accessible HTTPS image. Leave blank for a color
            cover.
          </small>
        </label>
        {changed && trip.stops.length > 0 && (
          <div className="notice">
            <label>
              When trip dates change
              <select
                value={mode}
                onChange={(e) => {
                  setMode(e.target.value as "day" | "date");
                  setApproved(false);
                }}
              >
                <option value="day">Keep Day 1, Day 2… positions</option>
                <option value="date">Keep original calendar dates</option>
              </select>
            </label>
            {displaced > 0 && (
              <label className="check-label">
                <input
                  type="checkbox"
                  checked={approved}
                  onChange={(e) => setApproved(e.target.checked)}
                />
                Move {displaced} affected activities to Unscheduled. Nothing
                will be deleted.
              </label>
            )}
          </div>
        )}
        {error && (
          <p className="form-error" role="alert">
            {error}
          </p>
        )}
        <button className="primary wide">
          {trip ? "Save changes" : "Create trip"}
        </button>
      </form>
    </Modal>
  );
}
