"use client";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function ReviewToggle({ id, published }: { id: string; published: boolean }) {
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

  return (
    <span>
      <button className="btn btn--ghost-dark btn--small" onClick={toggle} disabled={busy}>
        {busy ? "Saving…" : published ? "Hide from site" : "Show on site"}
      </button>
      {err && <span className="hint" role="alert"> Failed. Try again.</span>}
    </span>
  );
}
