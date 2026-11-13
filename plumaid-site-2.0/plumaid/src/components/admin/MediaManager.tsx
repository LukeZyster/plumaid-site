"use client";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { ArrowDown, ArrowUp, GripVertical, Pencil } from "lucide-react";
import EditMediaDialog from "./EditMediaDialog";
import { browserClient } from "@/lib/supabase/browser";
import type { MediaItem } from "@/lib/types";

const MAX_BYTES = 50 * 1024 * 1024; // Supabase free-plan per-file ceiling (matches the bucket limit)

const CATEGORY_LABEL: Record<MediaItem["category"], string> = {
  hero: "Big picture/video at the top of the home page",
  job: "Completed job: video or photo (home slideshow)",
  team: "Photo of the plumbers",
  business: "Photo of the business / van / workshop",
};

const ORDER: MediaItem["category"][] = ["job", "hero", "team", "business"];
const GROUP_TITLE: Record<MediaItem["category"], string> = {
  job: "Recent jobs carousel",
  hero: "Top of home page (hero)",
  team: "Team photos",
  business: "Business photos",
};

export default function MediaManager({ items }: { items: MediaItem[] }) {
  const [lists, setLists] = useState(() => group(items));
  const [dragId, setDragId] = useState<string | null>(null);
  const [overId, setOverId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [editing, setEditing] = useState<MediaItem | null>(null);
  useEffect(() => setLists(group(items)), [items]);

  async function move(c: MediaItem["category"], from: number, to: number) {
    if (to < 0 || to >= lists[c].length || from === to) return;
    const next = [...lists[c]];
    const [it] = next.splice(from, 1);
    next.splice(to, 0, it);
    setLists((l) => ({ ...l, [c]: next }));
    setSaving(true);
    const res = await fetch("/api/admin/media/reorder", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ids: next.map((x) => x.id) }),
    }).catch(() => null);
    setSaving(false);
    if (!res?.ok) setMsg({ kind: "bad", text: "Couldn't save the new order. Try again." });
    router.refresh();
  }

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
              : sign.error === "unauthorized"
                ? "Your login has expired. Please sign in again."
                : `Couldn't start the upload${sign.detail ? `: ${sign.detail}` : "."}${
                    /invalid|jws|api key/i.test(String(sign.detail ?? "")) ? " (The Supabase secret key in the settings is wrong.)" : ""
                  }${/bucket/i.test(String(sign.detail ?? "")) ? " (Run supabase/setup.sql to create the media bucket.)" : ""}`,
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

  async function toggle(item: MediaItem) {
    const res = await fetch(`/api/admin/media/${item.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ published: !item.published }),
    });
    if (res.ok) router.refresh();
    else setMsg({ kind: "bad", text: "Couldn't update that. Try again." });
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
            accept={category === "team" || category === "business" ? "image/jpeg,image/png,image/webp" : "video/mp4,video/webm,video/quicktime,image/jpeg,image/png,image/webp"}
            required
          />
          <span className="hint">
            Max 50 MB. Short videos (15–60 seconds) work best.
            {category === "hero" ? " The first hero item in its list is shown; hide or delete it to go back to the cartoon plumber." : ""}
          </span>
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
          ORDER.filter((c) => lists[c].length > 0).map((c) => (
            <section key={c} className="adm-media-group">
              <h3 className="adm-media-group-h">
                {GROUP_TITLE[c]} <span className="hint">({lists[c].length})</span>
              </h3>
              {lists[c].length > 1 && <p className="hint adm-media-tip">Drag to reorder, or use the arrows. The top one shows first.</p>}
              <ol className="adm-media-list">
                {lists[c].map((m, idx) => (
                  <li
                    key={m.id}
                    className={`adm-media-item ${dragId === m.id ? "is-dragging" : ""} ${overId === m.id ? "is-over" : ""}`}
                    draggable
                    onDragStart={() => setDragId(m.id)}
                    onDragEnd={() => {
                      setDragId(null);
                      setOverId(null);
                    }}
                    onDragOver={(e) => {
                      e.preventDefault();
                      if (overId !== m.id) setOverId(m.id);
                    }}
                    onDrop={(e) => {
                      e.preventDefault();
                      const from = lists[c].findIndex((x) => x.id === dragId);
                      if (from >= 0) move(c, from, idx);
                      setDragId(null);
                      setOverId(null);
                    }}
                  >
                    <span className="adm-media-pos" title="Drag to reorder">
                      <GripVertical size={16} aria-hidden="true" />
                      {idx + 1}
                    </span>
                    <button type="button" className="adm-thumb" onClick={() => setEditing(m)} aria-label={`Edit ${m.title || "this item"}`}>
                      {m.kind === "video" ? (
                        <video src={m.public_url} muted playsInline preload="metadata" />
                      ) : (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={m.public_url} alt={m.title || "Uploaded photo"} loading="lazy" />
                      )}
                    </button>
                    <div className="adm-media-meta">
                      <strong>{m.title || "(no title)"}</strong>
                      <span className="hint">{m.kind === "video" ? "Video" : "Photo"}</span>
                      {!m.published && <span className="chip chip--blocked">Hidden</span>}
                    </div>
                    <div className="adm-media-btns">
                      <button className="btn btn--ghost-dark btn--small btn--icon" onClick={() => move(c, idx, idx - 1)} disabled={idx === 0 || saving} aria-label="Move up">
                        <ArrowUp size={16} />
                      </button>
                      <button className="btn btn--ghost-dark btn--small btn--icon" onClick={() => move(c, idx, idx + 1)} disabled={idx === lists[c].length - 1 || saving} aria-label="Move down">
                        <ArrowDown size={16} />
                      </button>
                      <button className="btn btn--primary btn--small" onClick={() => setEditing(m)}><Pencil size={15} aria-hidden="true" /> Edit</button>
                      <button className="btn btn--ghost-dark btn--small" onClick={() => toggle(m)}>{m.published ? "Hide" : "Show"}</button>
                      <button className="btn btn--ghost-dark btn--small" onClick={() => remove(m)}>Delete</button>
                    </div>
                  </li>
                ))}
              </ol>
            </section>
          ))
        )}
        {saving && <p className="hint">Saving order…</p>}
        {editing && (
          <EditMediaDialog
            item={editing}
            onClose={() => setEditing(null)}
            onSaved={() => {
              setMsg({ kind: "ok", text: "Saved. The website is updated." });
              router.refresh();
            }}
          />
        )}
      </div>
    </div>
  );
}

function group(items: MediaItem[]): Record<MediaItem["category"], MediaItem[]> {
  const g: Record<MediaItem["category"], MediaItem[]> = { job: [], hero: [], team: [], business: [] };
  for (const it of items) g[it.category]?.push(it);
  return g;
}
