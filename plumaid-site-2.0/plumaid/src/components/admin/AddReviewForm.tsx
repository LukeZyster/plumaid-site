"use client";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { ImageUp, Star } from "lucide-react";
import { browserClient } from "@/lib/supabase/browser";

const SOURCES = [
  ["whatsapp", "WhatsApp"],
  ["facebook", "Facebook"],
  ["google", "Google"],
  ["sms", "SMS"],
  ["email", "Email"],
  ["in_person", "In person"],
  ["other", "Somewhere else"],
] as const;

const ERRORS: Record<string, string> = {
  name_required: "Add the customer's name, or tick “Keep them anonymous”.",
  need_text_or_screenshot: "Add what the customer said, a screenshot, or both.",
  needs_migration: "The database needs a quick update first: run supabase/migrations/003_admin_reviews.sql in Supabase.",
  unauthorized: "Please sign in again.",
};

/** The plumber adds a real review he received (WhatsApp, Facebook, Google, in person…). */
export default function AddReviewForm() {
  const router = useRouter();
  const [rating, setRating] = useState(5);
  const [hover, setHover] = useState(0);
  const [anonymous, setAnonymous] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<{ kind: "ok" | "bad"; text: string } | null>(null);

  useEffect(() => {
    if (!file) return setPreview(null);
    const u = URL.createObjectURL(file);
    setPreview(u);
    return () => URL.revokeObjectURL(u);
  }, [file]);

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const f = new FormData(form);
    setBusy(true);
    setMsg(null);
    try {
      let screenshotPath: string | undefined;
      if (file) {
        if (file.size > 15 * 1024 * 1024) throw new Error("That screenshot is over 15 MB.");
        const s = await fetch("/api/admin/reviews", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ action: "sign", contentType: file.type }),
        });
        const sj = await s.json();
        if (!s.ok) throw new Error(sj.error === "unsupported_type" ? "Screenshots must be JPG, PNG or WebP." : `Couldn't upload the screenshot${sj.detail ? `: ${sj.detail}` : "."}`);
        const { error } = await browserClient().storage.from("media").uploadToSignedUrl(sj.path, sj.token, file, { contentType: file.type });
        if (error) throw new Error("Screenshot upload failed. Try again.");
        screenshotPath = sj.path;
      }
      const res = await fetch("/api/admin/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "create",
          name: String(f.get("name") ?? ""),
          anonymous,
          source: f.get("source"),
          rating,
          comment: String(f.get("comment") ?? ""),
          reviewDate: String(f.get("reviewDate") ?? ""),
          screenshotPath,
          published: f.get("published") === "on",
        }),
      });
      const j = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(ERRORS[j.error] ?? "Couldn't save the review. Try again.");
      form.reset();
      setFile(null);
      setRating(5);
      setAnonymous(false);
      setMsg({ kind: "ok", text: "Review added." });
      router.refresh();
    } catch (err) {
      setMsg({ kind: "bad", text: err instanceof Error ? err.message : "Something went wrong." });
    } finally {
      setBusy(false);
    }
  }

  const shown = hover || rating;
  return (
    <form className="card form-grid adm-review-form" onSubmit={submit}>
      <h2 className="adm-h">Add a review you received</h2>
      <p className="hint" style={{ marginTop: -6 }}>
        Got a kind message on WhatsApp, Facebook or Google, or in person? Add it here. Only add real feedback from real customers.
      </p>

      <div className="field">
        <span className="legend" id="rv-stars">Star rating</span>
        <div className="star-pick" role="radiogroup" aria-labelledby="rv-stars" onMouseLeave={() => setHover(0)}>
          {[1, 2, 3, 4, 5].map((n) => (
            <button
              key={n}
              type="button"
              role="radio"
              aria-checked={rating === n}
              aria-label={`${n} star${n > 1 ? "s" : ""}`}
              className={n <= shown ? "on" : ""}
              onMouseEnter={() => setHover(n)}
              onClick={() => setRating(n)}
            >
              <Star size={30} fill="currentColor" />
            </button>
          ))}
        </div>
      </div>

      <div className="adm-two">
        <div className="field">
          <label htmlFor="rv-name">Customer name</label>
          <input id="rv-name" name="name" className="input" maxLength={80} disabled={anonymous} placeholder={anonymous ? "Anonymous customer" : "e.g. Sarah from Paarl"} required={!anonymous} />
        </div>
        <div className="field">
          <label htmlFor="rv-src">Where did they say it?</label>
          <select id="rv-src" name="source" className="select" defaultValue="whatsapp">
            {SOURCES.map(([v, l]) => (
              <option key={v} value={v}>{l}</option>
            ))}
          </select>
        </div>
      </div>
      <label className="check">
        <input type="checkbox" checked={anonymous} onChange={(e) => setAnonymous(e.target.checked)} /> Keep them anonymous
      </label>

      <div className="field">
        <label htmlFor="rv-msg">What they said</label>
        <textarea id="rv-msg" name="comment" className="textarea" maxLength={1500} placeholder="Copy their message here (optional if you add a screenshot)" />
      </div>

      <div className="adm-two">
        <div className="field">
          <label htmlFor="rv-date">Date (optional)</label>
          <input id="rv-date" name="reviewDate" type="date" className="input" />
        </div>
        <div className="field">
          <span className="legend">Screenshot (optional)</span>
          <label className="btn btn--ghost-dark adm-edit-file">
            <ImageUp size={18} aria-hidden="true" /> {file ? "Change screenshot" : "Add screenshot"}
            <input type="file" hidden accept="image/jpeg,image/png,image/webp" onChange={(e) => setFile(e.target.files?.[0] ?? null)} />
          </label>
        </div>
      </div>
      {preview && (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={preview} alt="Screenshot preview" className="adm-review-shot" />
      )}
      <p className="hint" style={{ margin: 0 }}>Tip: crop or cover phone numbers in screenshots before uploading.</p>

      <label className="check">
        <input type="checkbox" name="published" defaultChecked /> Show it on the website straight away
      </label>
      <button className="btn btn--primary" disabled={busy}>{busy ? "Saving…" : "Add review"}</button>
      {msg && <p className={`alert ${msg.kind === "ok" ? "alert--ok" : "alert--bad"}`} role="status">{msg.text}</p>}
    </form>
  );
}
