"use client";
import { useState } from "react";
import { browserClient } from "@/lib/supabase/browser";

export default function LoginForm() {
  const [busy, setBusy] = useState<false | "signing" | "opening">(false);
  const [error, setError] = useState<string | null>(null);
  const configured = Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY && !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY.startsWith("PASTE_"),
  );

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    setBusy("signing");
    setError(null);
    try {
      const { error } = await browserClient().auth.signInWithPassword({
        email: String(f.get("email") ?? "").trim(),
        password: String(f.get("password") ?? ""),
      });
      if (error) {
        setError("Email or password is wrong.");
        setBusy(false);
        return;
      }
      // Full page load so the server sees the new login cookie straight away
      // (a client-side push can reuse the old "not logged in" redirect).
      setBusy("opening");
      window.location.replace("/admin");
    } catch {
      setError("Couldn't reach the server. Try again.");
      setBusy(false);
    }
  }

  if (!configured) {
    return (
      <p className="alert alert--info">
        Supabase isn&apos;t connected yet. Add the environment variables (see README) and reload.
      </p>
    );
  }

  return (
    <form className="form-grid" onSubmit={submit}>
      <div className="field">
        <label htmlFor="l-email">Email</label>
        <input id="l-email" name="email" type="email" autoComplete="username" className="input" required />
      </div>
      <div className="field">
        <label htmlFor="l-pass">Password</label>
        <input id="l-pass" name="password" type="password" autoComplete="current-password" className="input" required />
      </div>
      <button className="btn btn--primary" disabled={busy !== false}>
        {busy === "signing" ? "Signing in…" : busy === "opening" ? "Opening your dashboard…" : "Sign in"}
      </button>
      {error && <p className="alert alert--bad" role="alert">{error}</p>}
    </form>
  );
}
