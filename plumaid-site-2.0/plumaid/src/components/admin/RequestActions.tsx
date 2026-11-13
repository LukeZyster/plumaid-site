"use client";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Check, X } from "lucide-react";

/** Accept / decline a pending booking request from the dashboard. The customer is emailed either way. */
export default function RequestActions({ id, firstName }: { id: string; firstName: string }) {
  const router = useRouter();
  const [mode, setMode] = useState<"accept" | "decline" | null>(null);
  const [note, setNote] = useState("");
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<{ kind: "ok" | "bad"; text: string } | null>(null);

  async function send() {
    if (!mode) return;
    setBusy(true);
    setMsg(null);
    try {
      const res = await fetch(`/api/admin/appointments/${id}/decide`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: mode, note }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setMsg({
          kind: "bad",
          text:
            data.error === "unauthorized"
              ? "Please sign in again."
              : data.error === "not_pending"
                ? "This request was already answered or cancelled."
                : "That didn't work. Try again.",
        });
      } else {
        if (data.emailed === false) {
          setMsg({ kind: "bad", text: `Saved, but the email to ${firstName} failed. Please let them know by phone.` });
        }
        router.refresh();
      }
    } catch {
      setMsg({ kind: "bad", text: "No connection. Try again." });
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="adm-actions adm-actions--req">
      {!mode ? (
        <>
          <button className="btn btn--accept btn--small" onClick={() => setMode("accept")}><Check size={17} aria-hidden="true" /> Accept</button>
          <button className="btn btn--decline btn--small" onClick={() => setMode("decline")}><X size={17} aria-hidden="true" /> Decline</button>
        </>
      ) : (
        <div className="adm-decide">
          <label className="hint" htmlFor={`note-${id}`}>
            {mode === "accept" ? "Accepting." : "Declining."} Add a message for {firstName} (optional):
          </label>
          <textarea
            id={`note-${id}`}
            className="textarea"
            rows={2}
            maxLength={500}
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder={mode === "accept" ? "E.g. I'll WhatsApp you when I'm on my way." : "E.g. Fully booked that day. Could Thursday work?"}
          />
          <div className="adm-decide-row">
            <button className={`btn btn--small ${mode === "accept" ? "btn--accept" : "btn--decline"}`} onClick={send} disabled={busy}>
              {busy ? "Sending…" : mode === "accept" ? "Accept & email customer" : "Decline & email customer"}
            </button>
            <button className="btn btn--ghost-dark btn--small" onClick={() => setMode(null)} disabled={busy}>Back</button>
          </div>
        </div>
      )}
      {msg && <p className={`alert ${msg.kind === "ok" ? "alert--ok" : "alert--bad"}`} role="status">{msg.text}</p>}
    </div>
  );
}
