"use client";
import { useRouter } from "next/navigation";
import { useState } from "react";

/** Plumber blocks out time (leave, lunch, a job elsewhere) so customers can't book it. */
export default function BlockForm({ date }: { date: string }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<{ kind: "ok" | "bad"; text: string } | null>(null);

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const f = new FormData(form);
    setBusy(true);
    setMsg(null);
    try {
      const res = await fetch("/api/admin/blocks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          date: f.get("date"),
          from: f.get("from"),
          to: f.get("to"),
          note: f.get("note") || "Unavailable",
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok) {
        setMsg({ kind: "ok", text: "Time blocked. Customers can't book it." });
        router.refresh();
      } else if (data.error === "overlaps_booking") {
        setMsg({ kind: "bad", text: "That overlaps an existing booking. Cancel or move that first." });
      } else if (data.error === "invalid_range") {
        setMsg({ kind: "bad", text: "The end time must be after the start time." });
      } else {
        setMsg({ kind: "bad", text: "Couldn't block that time. Try again." });
      }
    } catch {
      setMsg({ kind: "bad", text: "No connection. Try again." });
    } finally {
      setBusy(false);
    }
  }

  return (
    <form className="form-grid" onSubmit={submit} key={date}>
      <div className="field">
        <label htmlFor="b-date">Date</label>
        <input id="b-date" name="date" type="date" className="input" defaultValue={date} required />
      </div>
      <div className="adm-two">
        <div className="field">
          <label htmlFor="b-from">From</label>
          <input id="b-from" name="from" type="time" className="input" defaultValue="08:00" required />
        </div>
        <div className="field">
          <label htmlFor="b-to">Until</label>
          <input id="b-to" name="to" type="time" className="input" defaultValue="17:00" required />
        </div>
      </div>
      <div className="field">
        <label htmlFor="b-note">Reason (only you see this)</label>
        <input id="b-note" name="note" className="input" placeholder="Leave, supplier run, lunch…" maxLength={120} />
      </div>
      <button className="btn btn--navy" disabled={busy}>{busy ? "Blocking…" : "Block this time"}</button>
      {msg && <p className={`alert ${msg.kind === "ok" ? "alert--ok" : "alert--bad"}`} role="status">{msg.text}</p>}
    </form>
  );
}
