"use client";
import { useRouter } from "next/navigation";
import { useState } from "react";

/** Plumber marks a day, a few hours, or a run of days (leave) as booked so customers can't request it. */
export default function BlockForm({ date }: { date: string }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [allDay, setAllDay] = useState(true);
  const [msg, setMsg] = useState<{ kind: "ok" | "bad"; text: string } | null>(null);

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    setBusy(true);
    setMsg(null);
    try {
      const res = await fetch("/api/admin/blocks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          date: f.get("date"),
          until: f.get("until") || "",
          allDay,
          from: allDay ? undefined : f.get("from"),
          to: allDay ? undefined : f.get("to"),
          note: f.get("note") || "Unavailable",
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok) {
        const clash = data.clashes?.length ? ` Skipped ${data.clashes.join(", ")} (already has a booking).` : "";
        setMsg({ kind: "ok", text: `Done. ${data.created} ${data.created === 1 ? "day" : "days"} marked as booked.${clash}` });
        router.refresh();
      } else if (data.error === "overlaps_booking") {
        setMsg({ kind: "bad", text: "That overlaps an existing booking or request. Answer, cancel or move that first." });
      } else if (data.error === "invalid_range") {
        setMsg({ kind: "bad", text: "The end time must be after the start time." });
      } else {
        setMsg({ kind: "bad", text: "Couldn't save that. Try again." });
      }
    } catch {
      setMsg({ kind: "bad", text: "No connection. Try again." });
    } finally {
      setBusy(false);
    }
  }

  return (
    <form className="form-grid" onSubmit={submit} key={date}>
      <div className="adm-two">
        <div className="field">
          <label htmlFor="b-date">From day</label>
          <input id="b-date" name="date" type="date" className="input" defaultValue={date} required />
        </div>
        <div className="field">
          <label htmlFor="b-until">Until day <span className="hint">(optional)</span></label>
          <input id="b-until" name="until" type="date" className="input" />
        </div>
      </div>
      <label className="check">
        <input type="checkbox" checked={allDay} onChange={(e) => setAllDay(e.target.checked)} /> Whole day
      </label>
      {!allDay && (
        <div className="adm-two">
          <div className="field">
            <label htmlFor="b-from">From</label>
            <input id="b-from" name="from" type="time" className="input" defaultValue="08:00" required />
          </div>
          <div className="field">
            <label htmlFor="b-to">Until</label>
            <input id="b-to" name="to" type="time" className="input" defaultValue="12:00" required />
          </div>
        </div>
      )}
      <div className="field">
        <label htmlFor="b-note">Note (only you see this)</label>
        <input id="b-note" name="note" className="input" placeholder="Phone booking, leave, supplier run…" maxLength={120} />
      </div>
      <button className="btn btn--navy" disabled={busy}>{busy ? "Saving…" : "Mark as booked"}</button>
      {msg && <p className={`alert ${msg.kind === "ok" ? "alert--ok" : "alert--bad"}`} role="status">{msg.text}</p>}
    </form>
  );
}
