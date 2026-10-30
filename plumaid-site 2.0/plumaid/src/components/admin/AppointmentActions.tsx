"use client";
import { useRouter } from "next/navigation";
import { useState } from "react";

type Props = { id: string; status: string };

/** Mark done / cancel buttons on an appointment card. "Mark done" is what triggers the review email. */
export default function AppointmentActions({ id, status }: Props) {
  const router = useRouter();
  const [busy, setBusy] = useState<"complete" | "cancel" | null>(null);
  const [msg, setMsg] = useState<{ kind: "ok" | "bad"; text: string } | null>(null);

  async function run(kind: "complete" | "cancel") {
    const question =
      kind === "complete"
        ? "Mark this job as done?\n\nThe customer will be emailed a link to leave a review."
        : status === "blocked"
          ? "Remove this blocked time?"
          : "Cancel this appointment?\n\nThe time is released and the customer is emailed.";
    if (!window.confirm(question)) return;

    setBusy(kind);
    setMsg(null);
    try {
      const res = await fetch(`/api/admin/appointments/${id}/${kind}`, { method: "POST" });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setMsg({ kind: "bad", text: data.error === "unauthorized" ? "Please sign in again." : "That didn't work. Try again." });
      } else if (kind === "complete" && data.emailed === false) {
        setMsg({ kind: "bad", text: "Marked done, but the review email failed to send. Check the SMTP settings." });
        router.refresh();
      } else {
        router.refresh();
      }
    } catch {
      setMsg({ kind: "bad", text: "No connection. Try again." });
    } finally {
      setBusy(null);
    }
  }

  const canComplete = status === "confirmed";
  const canCancel = status === "confirmed" || status === "held" || status === "blocked";
  if (!canComplete && !canCancel) return null;

  return (
    <div className="adm-actions">
      {canComplete && (
        <button className="btn btn--primary btn--small" onClick={() => run("complete")} disabled={busy !== null}>
          {busy === "complete" ? "Saving…" : "✓ Mark job done"}
        </button>
      )}
      {canCancel && (
        <button className="btn btn--ghost-dark btn--small" onClick={() => run("cancel")} disabled={busy !== null}>
          {busy === "cancel" ? "Working…" : status === "blocked" ? "Remove block" : "Cancel"}
        </button>
      )}
      {msg && (
        <p className={`alert ${msg.kind === "ok" ? "alert--ok" : "alert--bad"}`} role="status">
          {msg.text}
        </p>
      )}
    </div>
  );
}
