"use client";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { browserClient } from "@/lib/supabase/browser";
import type { MediaItem } from "@/lib/types";

const MAX_BYTES = 50 * 1024 * 1024; // Supabase free-plan per-file ceiling (matches the bucket limit)

const CATEGORY_LABEL: Record<MediaItem["category"], string> = {
  job: "Completed-job video (home slideshow)",
  team: "Photo of the plumbers",
  business: "Photo of the business / van / workshop",
};

export default function MediaManager({ items }: { items: MediaItem[] }) {
  const router = useRouter();
  const [category, setCategory] = useState<MediaItem["category"]>("job");
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<{ kind: "ok" | "bad"; text: string } | null>(null);

  async function upload(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const f = new FormData(form);
    const file = f.get("file") as File | null;
    if (!file || !file.size) return setMsg({ kind: "bad", text: "Choose a file first." });
    if (file.size > MAX_BYTES) {
      return setMsg({ kind: "bad", text: "That file is over 50 MB. Trim or compress the video and try again." });
    }

    setBusy(true);
    setMsg(null);
    try {
      // 1. ask the server for a one-time upload URL
      const signRes = await fetch("/api/admin/media", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "sign", contentType: file.type, category }),
      });
      const sign = await signRes.json();
      if (!signRes.ok) {
        throw new Error(
          sign.error === "unsupported_type"
            ? "Use MP4, WebM or MOV for video, and JPG, PNG or WebP for photos."
            : sign.error === "jobs_need_video"
              ? "Completed-job slides must be videos."
              : "Couldn't start the upload.",
        );
      }

      // 2. send the file straight to Supabase Storage (not through Vercel)
      const { error } = await browserClient()
        .storage.from("media")
        .uploadToSignedUrl(sign.path, sign.token, file, { contentType: file.type });
      if (error) throw new Error("Upload failed. Check your connection and try again.");

      // 3. register it so it shows on the site
      const saveRes = await fetch("/api/admin/media", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "save",
          path: sign.path,
          contentType: file.type,
          category,
          title: f.get("title") ?? "",
          caption: f.get("caption") ?? "",
        }),
      });
      if (!saveRes.ok) throw new Error("Uploaded, but couldn't save it. Try again.");

      form.reset();
      setMsg({ kind: "ok", text: "Uploaded. It's now live on the site." });
      router.refresh();
    } catch (err) {
      setMsg({ kind: "bad", text: err instanceof Error ? err.message : "Something went wrong." });
    } finally {
      setBusy(false);
    }
  }

  async function remove(item: MediaItem) {
    if (!window.confirm(`Delete "${item.title || "this file"}" from the site? This can't be undone.`)) return;
    const res = await fetch(`/api/admin/media/${item.id}`, { method: "DELETE" });
    if (res.ok) router.refresh();
    else setMsg({ kind: "bad", text: "Couldn't delete that. Try again." });
  }

  return (
    <div className="adm-media">
      <form className="card form-grid" onSubmit={upload}>
        <h2 className="adm-h">Add to the site</h2>
        <div className="field">
          <label htmlFor="m-cat">What is it?</label>
          <select id="m-cat" className="select" value={category} onChange={(e) => setCategory(e.target.value as MediaItem["category"])}>
            {(Object.keys(CATEGORY_LABEL) as MediaItem["category"][]).map((c) => (
              <option key={c} value={c}>{CATEGORY_LABEL[c]}</option>
            ))}
          </select>
        </div>
        <div className="field">
          <label htmlFor="m-file">File</label>
          <input
            id="m-file"
            name="file"
            type="file"
            className="input"
            accept={category === "job" ? "video/mp4,video/webm,video/quicktime" : "image/jpeg,image/png,image/webp"}
            required
          />
          <span className="hint">Max 50 MB. Short videos (15–60 seconds) work best.</span>
        </div>
        <div className="field">
          <label htmlFor="m-title">Title</label>
          <input id="m-title" name="title" className="input" maxLength={80} placeholder="e.g. Geyser replacement, Wellington" />
        </div>
        <div className="field">
          <label htmlFor="m-cap">Caption (optional)</label>
          <input id="m-cap" name="caption" className="input" maxLength={200} placeholder="One line about the job" />
        </div>
        <button className="btn btn--primary" disabled={busy}>{busy ? "Uploading… please wait" : "Upload"}</button>
        {msg && <p className={`alert ${msg.kind === "ok" ? "alert--ok" : "alert--bad"}`} role="status">{msg.text}</p>}
      </form>

      <div>
        <h2 className="adm-h">On the site now ({items.length})</h2>
        {items.length === 0 ? (
          <p className="empty">Nothing uploaded yet. The home page shows friendly placeholders until you add something.</p>
        ) : (
          <ul className="adm-media-list">
            {items.map((m) => (
              <li key={m.id} className="adm-media-item">
                <div className="adm-thumb">
                  {m.kind === "video" ? (
                    <video src={m.public_url} muted playsInline preload="metadata" />
                  ) : (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={m.public_url} alt={m.title || "Uploaded photo"} loading="lazy" />
                  )}
                </div>
                <div className="adm-media-meta">
                  <strong>{m.title || "(no title)"}</strong>
                  <span className="hint">{CATEGORY_LABEL[m.category]}</span>
                </div>
                <button className="btn btn--ghost-dark btn--small" onClick={() => remove(m)}>Delete</button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
