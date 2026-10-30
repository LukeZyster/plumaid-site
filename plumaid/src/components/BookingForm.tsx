"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import { Mascot } from "./Brand";
import { site } from "@/content/site";

export type Day = { date: string; dow: string; dom: number; mon: string };
type Svc = { slug: string; name: string; description: string; duration: number };
type Slot = { time: string; start: string; available: boolean };

const fmtDate = (d: string) =>
  new Intl.DateTimeFormat("en-ZA", { weekday: "long", day: "numeric", month: "long", timeZone: "UTC" }).format(new Date(`${d}T12:00:00Z`));

const durationLabel = (m: number) => (m % 60 === 0 ? `${m / 60} hr` : m > 60 ? `${Math.floor(m / 60)} hr ${m % 60} min` : `${m} min`);

const ERRORS: Record<string, string> = {
  slot_taken: "That time was just booked by someone else. Please choose another time below.",
  rate_limited: "You have several unconfirmed bookings. Please check your email and confirm one, or try again in an hour.",
  email_failed: "We could not send your confirmation email. Please check the address, or call us on " + site.phoneDisplay + ".",
  invalid: "Some details look incomplete. Please check the form and try again.",
  invalid_slot: "That time is not available. Please pick another.",
  server_error: "Something went wrong on our side. Please try again, or call " + site.phoneDisplay + ".",
};

export default function BookingForm({
  services,
  days,
  initialService,
  holdMinutes,
  hoursNote,
}: {
  services: Svc[];
  days: Day[];
  initialService?: string;
  holdMinutes: number;
  hoursNote: string;
}) {
  const [service, setService] = useState(
    services.find((s) => s.slug === initialService)?.slug ?? services[0]?.slug ?? "",
  );
  const [date, setDate] = useState<string>("");
  const [slots, setSlots] = useState<Slot[] | null>(null);
  const [slotsErr, setSlotsErr] = useState("");
  const [time, setTime] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState<{ email: string } | null>(null);
  const slotRef = useRef<HTMLDivElement>(null);
  const formRef = useRef<HTMLFormElement>(null);

  const svc = services.find((s) => s.slug === service);

  const loadSlots = useCallback(async () => {
    if (!date || !service) return;
    setSlots(null);
    setSlotsErr("");
    try {
      const r = await fetch(`/api/availability?date=${date}&service=${service}`, { cache: "no-store" });
      const j = await r.json();
      if (!r.ok) throw new Error(j.error);
      setSlots(j.slots);
    } catch {
      setSlotsErr("Could not load times. Please refresh and try again.");
      setSlots([]);
    }
  }, [date, service]);

  useEffect(() => {
    setTime("");
    loadSlots();
  }, [loadSlots]);

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!date || !time) {
      setError("Please choose a date and a time first.");
      slotRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
      return;
    }
    setBusy(true);
    setError("");
    const f = new FormData(e.currentTarget);
    const body = {
      service,
      date,
      time,
      name: f.get("name"),
      email: f.get("email"),
      phone: f.get("phone"),
      address: f.get("address"),
      propertyType: f.get("propertyType"),
      notes: f.get("notes") || "",
      website: f.get("website") || "",
    };
    try {
      const r = await fetch("/api/bookings", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
      const j = await r.json().catch(() => ({}));
      if (r.ok && j.ok) {
        setDone({ email: String(body.email) });
        window.scrollTo({ top: 0, behavior: "smooth" });
        return;
      }
      setError(ERRORS[j.error] ?? ERRORS.server_error);
      if (j.error === "slot_taken") {
        // Someone beat us to it: refresh availability and ask for a different time.
        setTime("");
        await loadSlots();
        slotRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
      }
    } catch {
      setError(ERRORS.server_error);
    } finally {
      setBusy(false);
    }
  }

  if (done) {
    return (
      <div className="card narrow success" role="status">
        <Mascot size={150} className="mascot" />
        <h2>Check your email</h2>
        <p className="lead" style={{ margin: "0 auto 18px" }}>
          We sent a confirmation link to <strong>{done.email}</strong>. Tap it to confirm your appointment for{" "}
          <strong>{fmtDate(date)} at {time}</strong>.
        </p>
        <p className="hint">
          Your time is held for {holdMinutes} minutes. Nothing arrived? Check your spam folder, or call {site.phoneDisplay}.
        </p>
      </div>
    );
  }

  const availableCount = slots?.filter((s) => s.available).length ?? 0;

  return (
    <div className="booking">
      <form ref={formRef} onSubmit={submit} noValidate={false}>
        {/* 1 · service */}
        <fieldset className="bk-step" style={{ border: 0, padding: 0, margin: "0 0 34px" }}>
          <legend style={{ padding: 0 }}>
            <h2 style={{ display: "flex", gap: 12, alignItems: "center", margin: "0 0 16px", fontSize: "1.5rem" }}>
              <span className="bk-num">1</span> What do you need?
            </h2>
          </legend>
          <div className="svc-pick">
            {services.map((s) => (
              <label key={s.slug}>
                <input type="radio" name="service" value={s.slug} checked={service === s.slug} onChange={() => setService(s.slug)} />
                <span className="opt">
                  <span>
                    <strong>{s.name}</strong>
                    <small>{s.description}</small>
                  </span>
                  <span className="dur">about {durationLabel(s.duration)}</span>
                </span>
              </label>
            ))}
          </div>
        </fieldset>

        {/* 2 · date */}
        <div className={`bk-step ${date ? "done" : ""}`}>
          <h2><span className="bk-num">2</span> Pick a day</h2>
          <div className="date-strip" role="group" aria-label="Available days">
            {days.map((d) => (
              <button type="button" key={d.date} className="date-chip" aria-pressed={date === d.date} onClick={() => setDate(d.date)}>
                <span className="dow">{d.dow}</span>
                <span className="dom">{d.dom}</span>
                <span className="mon">{d.mon}</span>
              </button>
            ))}
          </div>
          <p className="slot-note">{hoursNote}</p>
        </div>

        {/* 3 · time */}
        <div className={`bk-step ${time ? "done" : ""}`} ref={slotRef}>
          <h2><span className="bk-num">3</span> Pick a time</h2>
          {!date ? (
            <p className="hint">Choose a day first to see the free times.</p>
          ) : slots === null ? (
            <div className="slot-grid" aria-busy="true" aria-label="Loading times">
              {Array.from({ length: 8 }).map((_, i) => <div key={i} className="skeleton" />)}
            </div>
          ) : slotsErr ? (
            <div className="alert alert--bad">{slotsErr}</div>
          ) : slots.length === 0 ? (
            <div className="alert alert--info">No times on this day. Please pick another day.</div>
          ) : (
            <>
              <div className="slot-grid" role="group" aria-label={`Times on ${fmtDate(date)}`}>
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
              <p className="slot-note">
                {availableCount === 0
                  ? "This day is fully booked. Please choose another day."
                  : "Crossed-out times are already booked."}
              </p>
            </>
          )}
        </div>

        {/* 4 · details */}
        <div className="bk-step">
          <h2><span className="bk-num">4</span> Where and who?</h2>
          <div className="form-grid form-grid--2">
            <div className="field">
              <label htmlFor="name">Full name</label>
              <input id="name" name="name" className="input" required minLength={2} maxLength={80} autoComplete="name" />
            </div>
            <div className="field">
              <label htmlFor="phone">Cell number</label>
              <input id="phone" name="phone" className="input" type="tel" required inputMode="tel" autoComplete="tel" placeholder="082 123 4567" />
            </div>
            <div className="field span-2">
              <label htmlFor="email">Email address</label>
              <input id="email" name="email" className="input" type="email" required autoComplete="email" placeholder="you@example.com" />
              <span className="hint">We send your confirmation link here.</span>
            </div>
            <div className="field span-2">
              <label htmlFor="address">Address of the job</label>
              <input id="address" name="address" className="input" required minLength={5} maxLength={200} autoComplete="street-address" placeholder="Street, suburb, town" />
            </div>
            <div className="field span-2">
              <span className="legend" id="pt">Property type</span>
              <div className="seg" role="radiogroup" aria-labelledby="pt">
                <label><input type="radio" name="propertyType" value="residential" defaultChecked /><span>Home</span></label>
                <label><input type="radio" name="propertyType" value="commercial" /><span>Small business</span></label>
              </div>
            </div>
            <div className="field span-2">
              <label htmlFor="notes">What is the problem? <span className="hint">(optional)</span></label>
              <textarea id="notes" name="notes" className="textarea" maxLength={1000} placeholder="E.g. geyser is leaking from the pipe above the tank" />
            </div>
            <div className="hp" aria-hidden="true">
              <label>Website <input name="website" tabIndex={-1} autoComplete="off" /></label>
            </div>
          </div>
        </div>

        {error && <div className="alert alert--bad" role="alert" style={{ marginBottom: 18 }}>{error}</div>}
        <button className="btn btn--primary" type="submit" disabled={busy}>
          {busy ? "Booking…" : "Book this appointment"}
        </button>
        <p className="hint" style={{ marginTop: 12 }}>
          By booking you agree that we may contact you about this appointment. We never share your details.
        </p>
      </form>

      <aside className="summary" aria-label="Booking summary">
        <h3>Your booking</h3>
        <dl>
          <div><dt>Service</dt><dd>{svc?.name ?? <span className="pending">Not chosen</span>}</dd></div>
          <div><dt>Day</dt><dd>{date ? fmtDate(date) : <span className="pending">Not chosen</span>}</dd></div>
          <div>
            <dt>Time</dt>
            <dd>{time ? `${time} (about ${durationLabel(svc?.duration ?? 60)})` : <span className="pending">Not chosen</span>}</dd>
          </div>
        </dl>
        <p className="note" style={{ marginTop: 0 }}>
          Prefer to talk? Call or WhatsApp <strong style={{ color: "#fff" }}>{site.phoneDisplay}</strong>.
        </p>
      </aside>
    </div>
  );
}
