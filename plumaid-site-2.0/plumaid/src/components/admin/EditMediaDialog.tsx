"use client";
import { useEffect, useRef, useState } from "react";
import { ImageUp, X } from "lucide-react";
import { browserClient } from "@/lib/supabase/browser";
import type { MediaItem } from "@/lib/types";

const MAX_BYTES = 50 * 1024 * 1024;
const SECTIONS: Record<MediaItem["category"], string> = {
  job: "Recent jobs carousel",
  hero: "Top of home page (hero)",
  team: "Team photos",
  business: "Business photos",
};

/** Edit one photo/video: title, caption, section, visible or hidden, and optionally swap the file. */
export default function EditMediaDialog({
  item,
  onClose,
  onSaved,
}: {
  item: MediaItem;
  onClose: () => void;
  onSaved: () => void;
}) {
  const ref = useRef<HTMLDialogElement>(null);
  const [title, setTitle] = useState(item.title);
  const [caption, setCaption] = useState(item.caption);
  const [category, setCategory] = useState<MediaItem["category"]>(item.category);
  const [published, setPublished] = useState(item.published);
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    ref.current?.showModal();
  }, []);
  useEffect(() => {
    if (!file) return setPreview(null);
    const url = URL.createObjectURL(file);
    setPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [file]);

  const photosOnly = category === "team" || category === "business";
  const showKind = file ? (file.type.startsWith("video/") ? "video" : "photo") : item.kind;

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (file && file.size > MAX_BYTES) return setError("That file is over 50 MB. Trim or compress it and try again.");
    if (photosOnly && showKind === "video") return setError("Team and business sections only take photos.");
    setBusy(true);
    try {
      const body: Record<string, unknown> = { title, caption, category, published };
      if (file) {
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
              : `Couldn't start the upload${sign.detail ? `: ${sign.detail}` : "."}`,
          );
        }
        const { error: upErr } = await browserClient()
          .storage.from("media")
          .uploadToSignedUrl(sign.path, sign.token, file, { contentType: file.type });
        if (upErr) throw new Error("Upload failed. Check your connection and try again.");
        body.path = sign.path;
        body.contentType = file.type;
      }
      const res = await fetch(`/api/admin/media/${item.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!res.ok) throw new Error("Couldn't save the changes. Try again.");
      onSaved();
      close();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setBusy(false);
    }
  }

  function close() {
    ref.current?.close();
    onClose();
  }

  return (
    <dialog
      ref={ref}
      className="bmodal adm-edit"
      aria-labelledby="edit-title"
      onCancel={(e) => {
        e.preventDefault();
        close();
      }}
    >
      <form className="bmodal-inner form-grid" onSubmit={save}>
        <button type="button" className="bmodal-x" onClick={close} aria-label="Close">
          <X size={20} />
        </button>
        <h2 id="edit-title" className="adm-h" style={{ marginTop: 0 }}>Edit {item.kind === "video" ? "video" : "photo"}</h2>

        <div className="adm-edit-preview">
          {showKind === "video" ? (
            <video src={preview ?? item.public_url} controls muted playsInline preload="metadata" />
          ) : (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={preview ?? item.public_url} alt="" />
          )}
          {file && <span className="chip chip--pending adm-edit-new">New file (saves when you click Save)</span>}
        </div>

        <label className="btn btn--ghost-dark adm-edit-file">
          <ImageUp size={18} aria-hidden="true" /> {file ? "Choose a different file" : "Replace photo or video"}
          <input
            type="file"
            hidden
            accept={photosOnly ? "image/jpeg,image/png,image/webp" : "video/mp4,video/webm,video/quicktime,image/jpeg,image/png,image/webp"}
            onChange={(e) => setFile(e.target.files?.[0] ?? null)}
          />
        </label>

        <div className="field">
          <label htmlFor="e-title">Title</label>
          <input id="e-title" className="input" maxLength={80} value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Geyser replacement, Wellington" />
        </div>
        <div className="field">
          <label htmlFor="e-cap">Caption</label>
          <input id="e-cap" className="input" maxLength={200} value={caption} onChange={(e) => setCaption(e.target.value)} placeholder="One line about the job" />
        </div>
        <div className="field">
          <label htmlFor="e-cat">Show it in</label>
          <select id="e-cat" className="select" value={category} onChange={(e) => setCategory(e.target.value as MediaItem["category"])}>
            {(Object.keys(SECTIONS) as MediaItem["category"][]).map((c) => (
              <option key={c} value={c}>{SECTIONS[c]}</option>
            ))}
          </select>
        </div>
        <label className="check">
          <input type="checkbox" checked={published} onChange={(e) => setPublished(e.target.checked)} /> Visible on the website
        </label>

        {error && <p className="alert alert--bad" role="alert">{error}</p>}
        <div className="bmodal-foot">
          <button type="button" className="btn btn--ghost-dark" onClick={close}>Cancel</button>
          <button className="btn btn--primary" disabled={busy}>{busy ? (file ? "Uploading…" : "Saving…") : "Save changes"}</button>
        </div>
      </form>
    </dialog>
  );
}
