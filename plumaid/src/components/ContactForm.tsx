"use client";
import { useState } from "react";
import { site } from "@/content/site";

export default function ContactForm() {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    setBusy(true);
    setError("");
    const f = new FormData(form);
    try {
      const r = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(Object.fromEntries(f.entries())),
      });
      const j = await r.json().catch(() => ({}));
      if (r.ok && j.ok) {
        setDone(true);
        form.reset();
      } else {
        setError(
          j.error === "invalid"
            ? "Please check your details. The message needs at least 10 characters."
            : `We could not send that. Please call or WhatsApp ${site.phoneDisplay}.`,
        );
      }
    } catch {
      setError("Network problem. Please try again.");
    } finally {
      setBusy(false);
    }
  }

  if (done) {
    return (
      <div className="alert alert--ok" role="status">
        Message sent. We will get back to you as soon as we can. For anything urgent, call {site.phoneDisplay}.
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="form-grid">
      <div className="field">
        <label htmlFor="c-name">Your name</label>
        <input id="c-name" name="name" className="input" required minLength={2} maxLength={80} autoComplete="name" />
      </div>
      <div className="field">
        <label htmlFor="c-email">Email</label>
        <input id="c-email" name="email" type="email" className="input" required autoComplete="email" />
      </div>
      <div className="field">
        <label htmlFor="c-phone">Phone <span className="hint">(optional)</span></label>
        <input id="c-phone" name="phone" type="tel" className="input" autoComplete="tel" />
      </div>
      <div className="field">
        <label htmlFor="c-msg">Message</label>
        <textarea id="c-msg" name="message" className="textarea" required minLength={10} maxLength={3000} />
      </div>
      <div className="hp" aria-hidden="true">
        <label>Website <input name="website" tabIndex={-1} autoComplete="off" /></label>
      </div>
      {error && <div className="alert alert--bad" role="alert">{error}</div>}
      <div>
        <button className="btn btn--primary" type="submit" disabled={busy}>{busy ? "Sending…" : "Send message"}</button>
      </div>
    </form>
  );
}
