"use client";
import Link from "next/link";
import { useState } from "react";
import { Check, X } from "lucide-react";
import { Mascot } from "./Brand";

const ERR: Record<string, string> = {
  not_pending: "This request has already been answered or cancelled.",
  past: "This time has already passed.",
  invalid: "This link is not valid any more.",
};

/**
 * Accept / decline screen for the plumber (opened from the request email).
 * A real button press is needed, so email link-scanners can't accept or decline by accident.
 */
export default function RespondForm({
  endpoint,
  token,
  initialAction,
  customerFirstName,
  when,
}: {
  endpoint: string;
  token?: string;
  initialAction: "accept" | "decline";
  customerFirstName: string;
  when: string;
}) {
  const [action, setAction] = useState<"accept" | "decline">(initialAction);
  const [note, setNote] = useState("");
  const [state, setState] = useState<"idle" | "busy" | "error">("idle");
  const [done, setDone] = useState<{ status: string; emailed: boolean } | null>(null);
  const [msg, setMsg] = useState("");

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setState("busy");
    try {
      const r = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, action, note }),
      });
      const j = await r.json().catch(() => ({}));
      if (r.ok && j.ok) {
        setDone({ status: j.status, emailed: j.emailed !== false });
        return;
      }
      setMsg(ERR[j.error] ?? "Something went wrong. Please try again, or answer from the admin dashboard.");
      setState("error");
    } catch {
      setMsg("No connection. Please try again.");
      setState("error");
    }
  }

  if (done) {
    const accepted = done.status === "confirmed";
    return (
      <div className="success" role="status">
        <Mascot size={140} className="mascot" wave={accepted} />
        <h2>{accepted ? "Accepted. It's on your calendar." : "Declined. The time is free again."}</h2>
        <p className="lead" style={{ margin: "0 auto 20px" }}>
          {done.emailed
            ? `${customerFirstName} has been emailed the outcome.`
            : `Saved, but the email to ${customerFirstName} failed to send. Please let them know by phone.`}
        </p>
        <Link href="/admin" className="btn btn--navy">Open dashboard</Link>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="form-grid">
      <div className="seg seg--decide" role="radiogroup" aria-label="Your answer">
        <label>
          <input type="radio" name="action" value="accept" checked={action === "accept"} onChange={() => setAction("accept")} />
          <span className="ico-label"><Check size={18} aria-hidden="true" /> Accept</span>
        </label>
        <label>
          <input type="radio" name="action" value="decline" checked={action === "decline"} onChange={() => setAction("decline")} />
          <span className="ico-label"><X size={18} aria-hidden="true" /> Decline</span>
        </label>
      </div>
      <div className="field">
        <label htmlFor="r-note">
          Message to {customerFirstName} <span className="hint">(optional)</span>
        </label>
        <textarea
          id="r-note"
          className="textarea"
          maxLength={500}
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder={
            action === "accept"
              ? "E.g. I'll WhatsApp you when I'm on my way."
              : "E.g. I'm fully booked that day. Could Thursday morning work?"
          }
        />
        <span className="hint">This is added to the email {customerFirstName} receives about {when}.</span>
      </div>
      {state === "error" && <div className="alert alert--bad" role="alert">{msg}</div>}
      <button className={`btn ${action === "accept" ? "btn--primary" : "btn--navy"}`} disabled={state === "busy"}>
        {state === "busy" ? "Saving…" : action === "accept" ? "Accept and email the customer" : "Decline and email the customer"}
      </button>
    </form>
  );
}
