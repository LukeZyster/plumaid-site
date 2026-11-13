"use client";
import { useState } from "react";
import { browserClient } from "@/lib/supabase/browser";

export default function SignOut({ className = "" }: { className?: string }) {
  const [busy, setBusy] = useState(false);
  return (
    <button
      className={className || "adm-link-btn"}
      disabled={busy}
      onClick={async () => {
        setBusy(true);
        await browserClient().auth.signOut();
        // Full page load so the login page sees the cleared cookie immediately.
        window.location.replace("/admin/login");
      }}
    >
      {busy ? "Signing out…" : "Sign out"}
    </button>
  );
}
