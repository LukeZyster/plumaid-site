"use client";
import Link from "next/link";
import { useState } from "react";
import { Mascot } from "./Brand";
import { site } from "@/content/site";

export default function ReviewForm({ token, defaultName, initialRating }: { token: string; defaultName: string; initialRating: number }) {
  const [rating, setRating] = useState(initialRating);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!rating) return setError("Please tap a star rating first.");
    setBusy(true);
    setError("");
    const f = new FormData(e.currentTarget);
    try {
      const r = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, rating, name: f.get("name"), comment: f.get("comment") ?? "" }),
      });
      const j = await r.json().catch(() => ({}));
      if (r.ok && j.ok) return setDone(true);
      setError(
        j.error === "already_reviewed"
          ? "You have already reviewed this job. Thank you!"
          : `Something went wrong. Please try again, or call ${site.phoneDisplay}.`,
      );
    } catch {
      setError("Network problem. Please try again.");
    } finally {
      setBusy(false);
    }
  }

  if (done) {
    return (
      <div className="success" role="status">
        <Mascot size={150} className="mascot" />
        <h2>Thank you!</h2>
        <p className="lead" style={{ margin: "0 auto 20px" }}>Your review is now on our site and helps others find a plumber they can trust.</p>
        <Link href="/reviews" className="btn btn--navy">See all reviews</Link>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="form-grid">
      <fieldset style={{ border: 0, padding: 0, margin: 0 }}>
        <legend className="legend" style={{ marginBottom: 6 }}>How would you rate the job?</legend>
        <div className="star-input">
          {[5, 4, 3, 2, 1].map((n) => (
            <span key={n} style={{ display: "contents" }}>
              <input type="radio" id={`s${n}`} name="rating" value={n} checked={rating === n} onChange={() => setRating(n)} />
              <label htmlFor={`s${n}`} title={`${n} star${n > 1 ? "s" : ""}`}>
                <span className="sr-only">{n} star{n > 1 ? "s" : ""}</span>
                <span aria-hidden="true">★</span>
              </label>
            </span>
          ))}
        </div>
      </fieldset>
      <div className="field">
        <label htmlFor="rname">Your name</label>
        <input id="rname" name="name" className="input" required maxLength={60} defaultValue={defaultName} />
        <span className="hint">Shown next to your review. First name only is fine.</span>
      </div>
      <div className="field">
        <label htmlFor="comment">Tell us about it <span className="hint">(optional)</span></label>
        <textarea id="comment" name="comment" className="textarea" maxLength={1200} placeholder="What went well? Anything we could do better?" />
      </div>
      {error && <div className="alert alert--bad" role="alert">{error}</div>}
      <div>
        <button className="btn btn--primary" type="submit" disabled={busy}>{busy ? "Sending…" : "Post my review"}</button>
      </div>
    </form>
  );
}
