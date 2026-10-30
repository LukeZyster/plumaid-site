"use client";
import Link from "next/link";
import { useState } from "react";
import { Mascot } from "./Brand";
import { site } from "@/content/site";

const MESSAGES: Record<string, string> = {
  slot_taken: "Sorry, this time was taken by another customer while your confirmation was waiting. Please book a new time.",
  cancelled: "This appointment was cancelled. Please book a new time.",
  past: "This appointment time has already passed.",
  invalid: "This link is not valid.",
  not_cancellable: "This appointment can no longer be cancelled online. Please call us.",
};

/** One-button confirmation for email links (verify / cancel). Needs a real click so email scanners can't trigger it. */
export default function TokenAction({
  endpoint,
  token,
  label,
  doneTitle,
  doneBody,
  danger = false,
}: {
  endpoint: string;
  token: string;
  label: string;
  doneTitle: string;
  doneBody: string;
  danger?: boolean;
}) {
  const [state, setState] = useState<"idle" | "busy" | "done" | "error">("idle");
  const [msg, setMsg] = useState("");

  async function run() {
    setState("busy");
    try {
      const r = await fetch(endpoint, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ token }) });
      const j = await r.json().catch(() => ({}));
      if (r.ok && j.ok) return setState("done");
      setMsg(MESSAGES[j.error] ?? `Something went wrong. Please call ${site.phoneDisplay}.`);
      setState("error");
    } catch {
      setMsg(`Network problem. Please try again, or call ${site.phoneDisplay}.`);
      setState("error");
    }
  }

  if (state === "done") {
    return (
      <div className="success" role="status">
        <Mascot size={140} className="mascot" />
        <h2>{doneTitle}</h2>
        <p className="lead" style={{ margin: "0 auto 20px" }}>{doneBody}</p>
        <Link href="/" className="btn btn--navy">Back to home</Link>
      </div>
    );
  }

  return (
    <div>
      {state === "error" && (
        <div className="alert alert--bad" role="alert" style={{ marginBottom: 16 }}>
          {msg} <Link href="/appointments">Book a new time</Link>
        </div>
      )}
      <button className={`btn ${danger ? "btn--ghost-dark" : "btn--primary"}`} onClick={run} disabled={state === "busy"}>
        {state === "busy" ? "One moment…" : label}
      </button>
    </div>
  );
}
