import type { Metadata } from "next";
import Link from "next/link";
import TokenAction from "@/components/TokenAction";
import { getByVerifyToken } from "@/lib/booking";
import { hasSupabase } from "@/lib/supabase/admin";
import { formatDate, formatTime } from "@/lib/time";

export const metadata: Metadata = { title: "Confirm your appointment", robots: { index: false } };
export const dynamic = "force-dynamic";

export default async function VerifyPage({ searchParams }: { searchParams: Promise<{ token?: string }> }) {
  const { token = "" } = await searchParams;
  const a = hasSupabase() ? await getByVerifyToken(token) : null;

  return (
    <section className="section">
      <div className="container">
        <div className="card narrow">
          {!a ? (
            <>
              <h1 style={{ fontSize: "2rem" }}>This link is not valid</h1>
              <p>It may be mistyped or expired. You can book a new time in under a minute.</p>
              <Link href="/appointments" className="btn btn--primary">Book a plumber</Link>
            </>
          ) : a.status === "cancelled" ? (
            <>
              <h1 style={{ fontSize: "2rem" }}>This appointment was cancelled</h1>
              <p>Please book a new time.</p>
              <Link href="/appointments" className="btn btn--primary">Book a plumber</Link>
            </>
          ) : a.status === "confirmed" || a.status === "completed" ? (
            <>
              <h1 style={{ fontSize: "2rem" }}>You are already confirmed</h1>
              <p className="lead">
                {formatDate(a.start_at)} at {formatTime(a.start_at)}. A confirmation email is in your inbox.
              </p>
              <Link href="/" className="btn btn--navy">Back to home</Link>
            </>
          ) : (
            <>
              <h1 style={{ fontSize: "2.2rem" }}>Confirm your appointment</h1>
              <p className="lead" style={{ marginBottom: 20 }}>
                {a.services?.name}
                <br />
                <strong style={{ color: "var(--navy)" }}>
                  {formatDate(a.start_at)}, {formatTime(a.start_at)} to {formatTime(a.end_at)}
                </strong>
                <br />
                {a.address}
              </p>
              <TokenAction
                endpoint="/api/bookings/verify"
                token={token}
                label="Confirm my appointment"
                doneTitle="You are booked in"
                doneBody={`We sent a confirmation to ${a.customer_email} and notified your plumber. See you on ${formatDate(a.start_at, { weekday: "long", day: "numeric", month: "long", year: undefined })} at ${formatTime(a.start_at)}.`}
              />
            </>
          )}
        </div>
      </div>
    </section>
  );
}
