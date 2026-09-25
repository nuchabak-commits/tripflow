import { useEffect, useId, useRef, useState } from "react";
import type { ReactNode } from "react";
import { CalendarDays, Clock } from "lucide-react";
import {
  formatDateInput,
  longDate,
  parseDateInput,
  parseTime,
} from "../lib/trips";
export type ComboOption<T> = {
  key: string;
  value: T;
  label: ReactNode;
  hint?: ReactNode;
  icon?: ReactNode;
};
/** Text input with a filterable listbox (WAI-ARIA combobox, list autocomplete). */
export function Combobox<T>({
  label,
  value,
  onInput,
  options,
  onPick,
  placeholder,
  loading,
  footer,
  icon,
  invalid,
  onBlur,
  inputMode,
  maxLength = 120,
  openOnFocus = false,
}: {
  label: ReactNode;
  value: string;
  onInput: (text: string) => void;
  options: ComboOption<T>[];
  onPick: (o: ComboOption<T>) => void;
  placeholder?: string;
  loading?: boolean;
  footer?: ReactNode;
  icon?: ReactNode;
  invalid?: boolean;
  onBlur?: () => void;
  inputMode?: "text" | "numeric" | "decimal";
  maxLength?: number;
  openOnFocus?: boolean;
}) {
  const id = useId();
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(-1);
  const list = useRef<HTMLUListElement>(null);
  useEffect(() => setActive(-1), [options.length, value]);
  useEffect(() => {
    list.current
      ?.querySelector(`[data-index="${active}"]`)
      ?.scrollIntoView({ block: "nearest" });
  }, [active]);
  const pick = (o: ComboOption<T>) => {
    onPick(o);
    setOpen(false);
  };
  const shown = open && (options.length > 0 || loading || footer);
  return (
    <div className="combo">
      <label htmlFor={id}>{label}</label>
      <div className={"combo-input" + (invalid ? " invalid" : "")}>
        {icon}
        <input
          id={id}
          role="combobox"
          aria-expanded={!!shown}
          aria-controls={id + "-list"}
          aria-autocomplete="list"
          aria-activedescendant={active >= 0 ? `${id}-${active}` : undefined}
          aria-invalid={invalid || undefined}
          autoComplete="off"
          spellCheck={false}
          inputMode={inputMode}
          maxLength={maxLength}
          value={value}
          placeholder={placeholder}
          onChange={(e) => {
            onInput(e.target.value);
            setOpen(true);
          }}
          onFocus={() => openOnFocus && setOpen(true)}
          onClick={() => setOpen(true)}
          onBlur={() => {
            setOpen(false);
            onBlur?.();
          }}
          onKeyDown={(e) => {
            if (e.key === "ArrowDown" || e.key === "ArrowUp") {
              e.preventDefault();
              setOpen(true);
              const n = options.length;
              if (n)
                setActive((a) =>
                  e.key === "ArrowDown" ? (a + 1) % n : (a - 1 + n) % n,
                );
            } else if (e.key === "Enter" && shown && active >= 0) {
              e.preventDefault();
              pick(options[active]);
            } else if (e.key === "Escape" && shown) {
              e.stopPropagation();
              e.preventDefault();
              setOpen(false);
            }
          }}
        />
      </div>
      {shown && (
        <ul className="combo-list" role="listbox" id={id + "-list"} ref={list}>
          {options.map((o, i) => (
            <li
              key={o.key}
              id={`${id}-${i}`}
              data-index={i}
              role="option"
              aria-selected={i === active}
              className={i === active ? "active" : ""}
              onMouseDown={(e) => e.preventDefault()}
              onMouseEnter={() => setActive(i)}
              onClick={() => pick(o)}
            >
              {o.icon && <span className="combo-icon">{o.icon}</span>}
              <span className="combo-text">
                <b>{o.label}</b>
                {o.hint && <small>{o.hint}</small>}
              </span>
            </li>
          ))}
          {loading && <li className="combo-status">Searching…</li>}
          {footer && (
            <li className="combo-status" onMouseDown={(e) => e.preventDefault()}>
              {footer}
            </li>
          )}
        </ul>
      )}
    </div>
  );
}
/** Day/month/year text entry with the browser calendar as a helper. */
export function DateField({
  label,
  value,
  onChange,
  min,
}: {
  label: string;
  value: string;
  onChange: (iso: string) => void;
  min?: string;
}) {
  const id = useId();
  const [text, setText] = useState(formatDateInput(value));
  const picker = useRef<HTMLInputElement>(null);
  useEffect(() => {
    // Sync only to a new valid date; an empty value means "being typed", so keep the text.
    if (value && parseDateInput(text) !== value) setText(formatDateInput(value));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);
  const parsed = parseDateInput(text);
  const invalid = !!text.trim() && !parsed;
  return (
    <div className="date-field">
      <label htmlFor={id}>{label}</label>
      <div className={"combo-input" + (invalid ? " invalid" : "")}>
        <input
          id={id}
          inputMode="numeric"
          autoComplete="off"
          placeholder="dd/mm/yyyy"
          maxLength={10}
          value={text}
          aria-invalid={invalid || undefined}
          aria-describedby={id + "-hint"}
          onChange={(e) => {
            let t = e.target.value.replace(/[^\d/.\-\s]/g, "");
            const grew = t.length > text.length;
            if (grew && /^\d{2}$|^\d{1,2}\/\d{2}$/.test(t)) t += "/";
            setText(t);
            onChange(parseDateInput(t) ?? "");
          }}
          onBlur={() => parsed && setText(formatDateInput(parsed))}
        />
        <button
          type="button"
          className="field-btn"
          aria-label={"Open calendar for " + label.toLowerCase()}
          onClick={() => {
            const el = picker.current;
            if (!el) return;
            try {
              el.showPicker();
            } catch {
              el.focus();
              el.click();
            }
          }}
        >
          <CalendarDays size={17} />
        </button>
        <input
          ref={picker}
          type="date"
          className="native-picker"
          tabIndex={-1}
          aria-hidden="true"
          value={value}
          min={min}
          onChange={(e) => {
            setText(formatDateInput(e.target.value));
            onChange(e.target.value);
          }}
        />
      </div>
      <small id={id + "-hint"} className={invalid ? "field-error" : "field-hint"}>
        {invalid ? "Use day/month/year, e.g. 26/12/2026" : value ? longDate(value) : "Day / month / year"}
      </small>
    </div>
  );
}
const SLOTS = Array.from({ length: 48 }, (_, i) => {
  const h = (i / 2 + 5) % 24;
  return `${String(Math.floor(h)).padStart(2, "0")}:${i % 2 ? "30" : "00"}`;
});
/** 24-hour time with typed shortcuts ("930", "1pm") and half-hour suggestions. */
export function TimeField({
  value,
  onChange,
  onValidity,
}: {
  value: string;
  onChange: (time: string) => void;
  onValidity?: (ok: boolean) => void;
}) {
  const [text, setText] = useState(value);
  useEffect(() => {
    if (parseTime(text) !== value) setText(value);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);
  const parsed = parseTime(text);
  const digits = text.replace(/\D/g, "");
  // "9" matches 09:00/09:30, "13" matches 13:00/13:30, "930" matches 09:30.
  const matches = SLOTS.filter((s) => {
    const compact = s.replace(":", "");
    return !digits || compact.startsWith(digits) || compact.replace(/^0/, "").startsWith(digits);
  });
  const options = [
    ...(parsed && !matches.includes(parsed) ? [parsed] : []),
    ...(parsed === "" ? SLOTS : matches),
  ].slice(0, 48);
  return (
    <Combobox
      label="Time · 24-hour"
      icon={<Clock size={16} className="combo-lead" />}
      value={text}
      inputMode="text"
      maxLength={8}
      placeholder="13:30"
      invalid={parsed === null}
      openOnFocus
      onInput={(t) => {
        setText(t);
        const p = parseTime(t);
        onValidity?.(p !== null);
        if (p !== null) onChange(p);
      }}
      onBlur={() => {
        const p = parseTime(text);
        if (p !== null) setText(p);
      }}
      options={options.map((s) => ({ key: s, value: s, label: s }))}
      onPick={(o) => {
        setText(o.value);
        onValidity?.(true);
        onChange(o.value);
      }}
      footer={
        parsed === null ? (
          <span className="field-error">Type 24-hour time, e.g. 09:30 or 1930</span>
        ) : undefined
      }
    />
  );
}
const EMOJI = [
  "✈️", "🧳", "🏝️", "🏖️", "🏔️", "🗻", "🌋", "🏕️",
  "🌆", "🏙️", "🌃", "🏯", "⛩️", "🛕", "🕌", "🗼",
  "🗽", "🎡", "🚆", "🚗", "🛳️", "🚲", "🐼", "🐘",
  "🌸", "🍁", "❄️", "☀️", "🌊", "🌿", "🍜", "🍣",
  "🥘", "☕", "🍷", "🎒",
];
export const graphemes = (text: string) => {
  try {
    // Intl.Segmenter is ES2022; the app targets ES2020 typings.
    const Segmenter = (Intl as unknown as {
      Segmenter: new (l?: string, o?: { granularity: string }) => {
        segment: (t: string) => Iterable<unknown>;
      };
    }).Segmenter;
    return [...new Segmenter(undefined, { granularity: "grapheme" }).segment(text)].length;
  } catch {
    return [...text].length;
  }
};
export function EmojiField({
  value,
  onChange,
}: {
  value: string;
  onChange: (v: string) => void;
}) {
  const id = useId();
  return (
    <fieldset className="emoji-field">
      <legend>Travel icon</legend>
      <div className="emoji-grid" role="radiogroup" aria-label="Suggested icons">
        {EMOJI.map((e) => (
          <button
            type="button"
            key={e}
            role="radio"
            aria-checked={value === e}
            aria-label={"Icon " + e}
            className={value === e ? "on" : ""}
            onClick={() => onChange(e)}
          >
            {e}
          </button>
        ))}
      </div>
      <div className="emoji-custom">
        <label htmlFor={id}>Or type any emoji / 1–2 characters</label>
        <input
          id={id}
          value={value}
          maxLength={16}
          placeholder="🐨"
          onChange={(e) => {
            const v = e.target.value.trim();
            if (graphemes(v) <= 2) onChange(v);
          }}
        />
        <small>Windows: Win + . · Mac: Ctrl + Cmd + Space opens the emoji keyboard</small>
      </div>
    </fieldset>
  );
}
