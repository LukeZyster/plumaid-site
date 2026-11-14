"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import { CalendarCheck2, CalendarX2, Clock } from "lucide-react";
import { Mascot } from "./Brand";
import { site } from "@/content/site";

type Svc = { slug: string; name: string; description: string; duration: number };
type Slot = { time: string; start: string; available: boolean };
type DayState = "past" | "closed" | "full" | "busy" | "free" | "out";
type MonthDay = { date: string; state: DayState; free: number; booked: { from: string; to: string }[]; allDay: boolean };

const DOW = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

const fmtLong = (d: string) =>
  new Intl.DateTimeFormat("en-ZA", { weekday: "long", day: "numeric", month: "long", timeZone: "UTC" }).format(new Date(`${d}T12:00:00Z`));
const fmtShort = (d: string) =>
  new Intl.DateTimeFormat("en-ZA", { weekday: "short", day: "numeric", month: "short", timeZone: "UTC" }).format(new Date(`${d}T12:00:00Z`));
const fmtMonth = (m: string) =>
  new Intl.DateTimeFormat("en-ZA", { month: "long", year: "numeric", timeZone: "UTC" }).format(new Date(`${m}-15T12:00:00Z`));
const shiftMonth = (m: string, by: number) => {
  const [y, mo] = m.split("-").map(Number);
  const d = new Date(Date.UTC(y, mo - 1 + by, 1));
  return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, "0")}`;
};
const sastToday = () =>
  new Intl.DateTimeFormat("en-CA", { timeZone: "Africa/Johannesburg", year: "numeric", month: "2-digit", day: "2-digit" }).format(new Date());
const durationLabel = (m: number) => (m % 60 === 0 ? `${m / 60} hr` : m > 60 ? `${Math.floor(m / 60)} hr ${m % 60} min` : `${m} min`);

const STATE_LABEL: Record<DayState, string> = {
  free: "Available",
  busy: "Some times booked",
  full: "Fully booked",
  closed: "Closed",
  past: "Past",
  out: "Not open for booking yet",
};

const ERRORS: Record<string, string> = {
  slot_taken: "Someone has just requested that time. Please pick another time.",
  rate_limited: "You already have a few requests waiting. Please wait for the plumber to answer, or call us.",
  email_failed: `We couldn't reach the plumber by email just now. Please call or WhatsApp ${site.phoneDisplay}.`,
  invalid: "Some details look incomplete. Please check the highlighted fields.",
  invalid_slot: "That time is not available. Please pick another.",
  not_configured: `Online booking is being set up. Please call or WhatsApp ${site.phoneDisplay} for now.`,
  server_error: `Something went wrong on our side. Please try again, or call ${site.phoneDisplay}.`,
};

/**
 * Public booking calendar.
 * Customers see which days are free / partly booked / full, click a day,
 * and a pop-up collects their details and sends the plumber a request to accept or decline.
 */
export default function BookingCalendar({
  services,
  initialService,
  hoursNote,
}: {
  services: Svc[];
  initialService?: string;
  hoursNote: string;
}) {
  const today = sastToday();
  const [month, setMonth] = useState(today.slice(0, 7));
  const [days, setDays] = useState<MonthDay[] | null>(null);
  const [loadErr, setLoadErr] = useState(false);
  const [openDate, setOpenDate] = useState<string | null>(null);
  const [hoverDate, setHoverDate] = useState<string | null>(null);
  const [service, setService] = useState(services.find((s) => s.slug === initialService)?.slug ?? services[0]?.slug ?? "");

  // Months already fetched (keyed by month + job length), so flicking between months is instant.
  const cache = useRef(new Map<string, MonthDay[]>());
  const duration = services.find((s) => s.slug === service)?.duration ?? 60;

  const fetchMonth = useCallback(
    async (m: string, fresh = false): Promise<MonthDay[]> => {
      const key = `${m}|${duration}`;
      const hit = cache.current.get(key);
      if (hit && !fresh) return hit;
      const ctrl = new AbortController();
      const t = setTimeout(() => ctrl.abort(), 9000);
      try {
        const r = await fetch(`/api/availability/month?month=${m}&duration=${duration}${fresh ? `&t=${Date.now()}` : ""}`, { signal: ctrl.signal, cache: fresh ? "no-store" : "default" });
        const j = await r.json();
        if (!r.ok) throw new Error(j.error);
        cache.current.set(key, j.days);
        return j.days;
      } finally {
        clearTimeout(t);
      }
    },
    [duration],
  );

  const loadMonth = useCallback(
    async (fresh = false) => {
      const key = `${month}|${duration}`;
      setDays(fresh ? null : cache.current.get(key) ?? null);
      setLoadErr(false);
      try {
        setDays(await fetchMonth(month, fresh));
        // Warm up the next month in the background so the arrow feels instant.
        fetchMonth(shiftMonth(month, 1)).catch(() => {});
      } catch {
        setLoadErr(true);
        setDays([]);
      }
    },
    [month, duration, fetchMonth],
  );

  useEffect(() => {
    loadMonth();
  }, [loadMonth]);

  const bookedDays = (days ?? []).filter((d) => d.booked.length > 0 && d.date >= today);
  const first = `${month}-01`;
  const lead = (new Date(`${first}T12:00:00Z`).getUTCDay() + 6) % 7;
  const canGoBack = month > today.slice(0, 7);
  const maxMonth = shiftMonth(today.slice(0, 7), 2);

  return (
    <div className="bcal-wrap">
      <div className="bcal-card">
        <div className="bcal-head">
          <button type="button" className="bcal-nav" onClick={() => setMonth(shiftMonth(month, -1))} disabled={!canGoBack} aria-label="Previous month">‹</button>
          <h2 aria-live="polite">{fmtMonth(month)}</h2>
          <button type="button" className="bcal-nav" onClick={() => setMonth(shiftMonth(month, 1))} disabled={month >= maxMonth} aria-label="Next month">›</button>
        </div>

        <div className="bcal-grid" role="grid" aria-label={`Availability for ${fmtMonth(month)}`}>
          {DOW.map((d) => (
            <div key={d} className="bcal-dow" role="columnheader">{d}</div>
          ))}
          {Array.from({ length: lead }).map((_, i) => <div key={`e${i}`} className="bcal-day bcal-day--empty" />)}
          {days === null
            ? Array.from({ length: 30 }).map((_, i) => <div key={`s${i}`} className="bcal-day skeleton" />)
            : days.map((d) => {
                const clickable = d.state === "free" || d.state === "busy";
                const n = Number(d.date.slice(8));
                return (
                  <button
                    type="button"
                    key={d.date}
                    className={`bcal-day bcal-day--${d.state} ${d.date === today ? "is-today" : ""}`}
                    disabled={!clickable}
                    onClick={() => setOpenDate(d.date)}
                    onMouseEnter={() => setHoverDate(d.date)}
                    onMouseLeave={() => setHoverDate(null)}
                    aria-label={`${fmtLong(d.date)}: ${STATE_LABEL[d.state]}`}
                  >
                    <span className="bcal-num">{n}</span>
                    {clickable && <span className="bcal-free">{d.state === "busy" ? `${d.free} left` : "Open"}</span>}
                    {d.state === "full" && <span className="bcal-free">{d.allDay ? "All day" : "Booked"}</span>}
                    {d.booked.length > 0 && d.state !== "past" && <span className="bcal-dot" aria-hidden="true" />}
                  </button>
                );
              })}
        </div>

        {loadErr && (
          <div className="alert alert--bad" style={{ marginTop: 14 }}>
            Couldn&apos;t load the calendar. <button type="button" className="linkish" onClick={() => loadMonth(true)}>Try again</button>
          </div>
        )}

      </div>

      <aside className="bcal-side" aria-label={`Booked times in ${fmtMonth(month)}`}>
        <h3 className="bcal-side-title"><CalendarCheck2 size={20} aria-hidden="true" /> Booked in {fmtMonth(month).split(" ")[0]}</h3>
        {days === null ? (
          <ul className="bcal-booked">
            {Array.from({ length: 3 }).map((_, i) => <li key={i} className="skeleton bcal-booked-sk" />)}
          </ul>
        ) : bookedDays.length === 0 ? (
          <p className="bcal-none">No bookings yet this month. Every open day is available.</p>
        ) : (
          <ul className="bcal-booked">
            {bookedDays.map((d) => {
              const canBook = d.state === "free" || d.state === "busy";
              return (
                <li key={d.date} className={`${hoverDate === d.date ? "is-active" : ""} ${d.allDay || d.state === "full" ? "is-full" : ""}`}>
                  <button type="button" disabled={!canBook} onClick={() => canBook && setOpenDate(d.date)} title={canBook ? "Book a free time on this day" : "This day is fully booked"}>
                    <span className="bcal-booked-date">{fmtShort(d.date)}</span>
                    <span className="bcal-booked-times">
                      {d.allDay ? (
                        <span className="bcal-chip bcal-chip--full"><CalendarX2 size={14} aria-hidden="true" /> All day</span>
                      ) : (
                        d.booked.map((b) => (
                          <span key={b.from} className="bcal-chip"><Clock size={13} aria-hidden="true" /> {b.from}–{b.to}</span>
                        ))
                      )}
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
        )}
        <p className="bcal-side-foot">{hoursNote}</p>
        <p className="bcal-side-foot">
          Urgent? Call or WhatsApp <a href={`tel:${site.phoneTel}`}>{site.phoneDisplay}</a>.
        </p>
      </aside>

      {openDate && (
        <BookingModal
          date={openDate}
          services={services}
          service={service}
          setService={setService}
          onClose={(sent) => {
            setOpenDate(null);
            if (sent) loadMonth(true);
          }}
        />
      )}
    </div>
  );
}

function BookingModal({
  date,
  services,
  service,
  setService,
  onClose,
}: {
  date: string;
  services: Svc[];
  service: string;
  setService: (s: string) => void;
  onClose: (sent: boolean) => void;
}) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [slots, setSlots] = useState<Slot[] | null>(null);
  const [time, setTime] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [badFields, setBadFields] = useState<string[]>([]);
  const [sent, setSent] = useState<{ email: string; first: string } | null>(null);
  const svc = services.find((s) => s.slug === service);

  useEffect(() => {
    const d = dialogRef.current;
    if (d && !d.open) d.showModal();
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, []);

  const loadSlots = useCallback(async () => {
    setSlots(null);
    try {
      const r = await fetch(`/api/availability?date=${date}&service=${service}`, { cache: "no-store" });
      const j = await r.json();
      if (!r.ok) throw new Error();
      setSlots(j.slots);
    } catch {
      setSlots([]);
    }
  }, [date, service]);

  useEffect(() => {
    setTime("");
    loadSlots();
  }, [loadSlots]);

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!time) {
      setError("Please choose a time.");
      return;
    }
    setBusy(true);
    setError("");
    setBadFields([]);
    const f = new FormData(e.currentTarget);
    const body = {
      service,
      date,
      time,
      firstName: f.get("firstName"),
      lastName: f.get("lastName"),
      email: f.get("email"),
      phone: f.get("phone"),
      address: f.get("address"),
      propertyType: f.get("propertyType"),
      message: f.get("message"),
      website: f.get("website"),
    };
    try {
      const r = await fetch("/api/bookings", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
      const j = await r.json().catch(() => ({}));
      if (r.ok && j.ok) {
        setSent({ email: String(body.email), first: String(body.firstName) });
        return;
      }
      setError(ERRORS[j.error] ?? ERRORS.server_error);
      if (j.fields) setBadFields(j.fields);
      if (j.error === "slot_taken") {
        setTime("");
        loadSlots();
      }
    } catch {
      setError(ERRORS.server_error);
    } finally {
      setBusy(false);
    }
  }

  const close = () => {
    dialogRef.current?.close();
    onClose(Boolean(sent));
  };
  const bad = (name: string) => (badFields.includes(name) ? " input--bad" : "");

  return (
    <dialog
      ref={dialogRef}
      className="bmodal"
      aria-labelledby="bmodal-title"
      onCancel={(e) => {
        e.preventDefault();
        close();
      }}
      onClick={(e) => {
        if (e.target === dialogRef.current) close();
      }}
    >
      <div className="bmodal-inner">
        <button type="button" className="bmodal-x" onClick={close} aria-label="Close">×</button>

        {sent ? (
          <div className="success bmodal-done" role="status">
            <Mascot size={150} className="mascot" wave />
            <h2 id="bmodal-title">Request sent, {sent.first}!</h2>
            <p className="lead" style={{ margin: "0 auto 14px" }}>
              Your plumber has been notified about <strong>{fmtLong(date)} at {time}</strong>. As soon as he accepts or
              declines, we&apos;ll email <strong>{sent.email}</strong>.
            </p>
            <p className="hint">Nothing in your inbox? Check spam, or call {site.phoneDisplay}.</p>
            <button type="button" className="btn btn--navy" onClick={close}>Done</button>
          </div>
        ) : (
          <form onSubmit={submit}>
            <div className="bmodal-head">
              <span className="bmodal-drop" aria-hidden="true" />
              <div>
                <p className="eyebrow">Booking request</p>
                <h2 id="bmodal-title">{fmtLong(date)}</h2>
              </div>
            </div>

            <div className="form-grid form-grid--2">
              <div className="field span-2">
                <label htmlFor="bm-service">What do you need?</label>
                <select id="bm-service" className="select" value={service} onChange={(e) => setService(e.target.value)}>
                  {services.map((s) => (
                    <option key={s.slug} value={s.slug}>{s.name} (about {durationLabel(s.duration)})</option>
                  ))}
                </select>
                {svc && <span className="hint">{svc.description}</span>}
              </div>

              <div className="field span-2">
                <span className="legend">Preferred time</span>
                {slots === null ? (
                  <div className="slot-grid" aria-busy="true">
                    {Array.from({ length: 8 }).map((_, i) => <div key={i} className="skeleton" />)}
                  </div>
                ) : slots.filter((s) => s.available).length === 0 ? (
                  <div className="alert alert--info">No free times left on this day for this service. Please close and pick another day.</div>
                ) : (
                  <div className="slot-grid" role="group" aria-label="Times">
                    {slots.map((s) => (
                      <button
                        type="button"
                        key={s.time}
                        className="slot"
                        disabled={!s.available}
                        aria-pressed={time === s.time}
                        aria-label={s.available ? s.time : `${s.time}, already booked`}
                        onClick={() => setTime(s.time)}
                      >
                        {s.time}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <div className="field">
                <label htmlFor="bm-first">First name</label>
                <input id="bm-first" name="firstName" className={`input${bad("firstName")}`} required maxLength={40} autoComplete="given-name" />
              </div>
              <div className="field">
                <label htmlFor="bm-last">Surname</label>
                <input id="bm-last" name="lastName" className={`input${bad("lastName")}`} maxLength={40} autoComplete="family-name" />
              </div>
              <div className="field">
                <label htmlFor="bm-email">Email</label>
                <input id="bm-email" name="email" type="email" className={`input${bad("email")}`} required autoComplete="email" placeholder="you@example.com" />
              </div>
              <div className="field">
                <label htmlFor="bm-phone">Cell number</label>
                <input id="bm-phone" name="phone" type="tel" className={`input${bad("phone")}`} required inputMode="tel" autoComplete="tel" placeholder="082 123 4567" />
              </div>
              <div className="field span-2">
                <label htmlFor="bm-address">Address <span className="hint">(optional)</span></label>
                <input id="bm-address" name="address" className={`input${bad("address")}`} maxLength={200} autoComplete="street-address" placeholder="Street, suburb, town" />
              </div>
              <div className="field span-2">
                <span className="legend" id="bm-pt">Property type</span>
                <div className="seg" role="radiogroup" aria-labelledby="bm-pt">
                  <label><input type="radio" name="propertyType" value="residential" defaultChecked /><span>Home</span></label>
                  <label><input type="radio" name="propertyType" value="commercial" /><span>Business</span></label>
                </div>
              </div>
              <div className="field span-2">
                <label htmlFor="bm-msg">Message</label>
                <textarea
                  id="bm-msg"
                  name="message"
                  className={`textarea${bad("message")}`}
                  maxLength={1500}
                  placeholder="Tell us what's wrong, e.g. the geyser is leaking from the pipe above the tank."
                />
              </div>
              <div className="hp" aria-hidden="true">
                <label>Website <input name="website" tabIndex={-1} autoComplete="off" /></label>
              </div>
            </div>

            {error && <div className="alert alert--bad" role="alert" style={{ margin: "14px 0 0" }}>{error}</div>}
            <div className="bmodal-foot">
              <button type="button" className="btn btn--ghost-dark" onClick={close}>Cancel</button>
              <button className="btn btn--primary" type="submit" disabled={busy}>
                {busy ? "Sending…" : time ? `Request ${time}` : "Send request"}
              </button>
            </div>
            <p className="hint" style={{ marginTop: 10 }}>
              This is a request. Your plumber confirms it by email. We never share your details.
            </p>
          </form>
        )}
      </div>
    </dialog>
  );
}
