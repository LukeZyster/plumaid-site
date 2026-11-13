"use client";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function ReviewToggle({ id, published, canDelete = false }: { id: string; published: boolean; canDelete?: boolean }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState(false);

  async function toggle() {
    setBusy(true);
    setErr(false);
    try {
      const res = await fetch(`/api/admin/reviews/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ published: !published }),
      });
      if (!res.ok) throw new Error();
      router.refresh();
    } catch {
      setErr(true);
    } finally {
      setBusy(false);
    }
  }

  async function remove() {
    if (!window.confirm("Delete this review? This can't be undone.")) return;
    setBusy(true);
    const res = await fetch(`/api/admin/reviews/${id}`, { method: "DELETE" }).catch(() => null);
    setBusy(false);
    if (res?.ok) router.refresh();
    else setErr(true);
  }

  return (
    <span className="adm-actions">
      <button className="btn btn--ghost-dark btn--small" onClick={toggle} disabled={busy}>
        {busy ? "Saving…" : published ? "Hide from site" : "Show on site"}
      </button>
      {canDelete && (
        <button className="btn btn--ghost-dark btn--small" onClick={remove} disabled={busy}>Delete</button>
      )}
      {err && <span className="hint" role="alert"> Failed. Try again.</span>}
    </span>
  );
}
