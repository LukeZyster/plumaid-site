import type { Metadata } from "next";
import Link from "next/link";
import TokenAction from "@/components/TokenAction";
import { getByVerifyToken } from "@/lib/booking";
import { hasSupabase } from "@/lib/supabase/admin";
import { formatDate, formatTime } from "@/lib/time";
import { site } from "@/content/site";

export const metadata: Metadata = { title: "Cancel your appointment", robots: { index: false } };
export const dynamic = "force-dynamic";

export default async function CancelPage({ searchParams }: { searchParams: Promise<{ token?: string }> }) {
  const { token = "" } = await searchParams;
  const a = hasSupabase() ? await getByVerifyToken(token) : null;
  const cancellable = a && ["held", "confirmed"].includes(a.status) && new Date(a.start_at) > new Date();

  return (
    <section className="section">
      <div className="container">
        <div className="card narrow">
          {!a ? (
            <>
              <h1 style={{ fontSize: "2rem" }}>This link is not valid</h1>
              <p>Please call {site.phoneDisplay} and we will help.</p>
            </>
          ) : a.status === "cancelled" ? (
            <>
              <h1 style={{ fontSize: "2rem" }}>Already cancelled</h1>
              <Link href="/appointments" className="btn btn--primary">Book a new time</Link>
            </>
          ) : !cancellable ? (
            <>
              <h1 style={{ fontSize: "2rem" }}>This appointment cannot be cancelled online</h1>
              <p>Please call or WhatsApp {site.phoneDisplay}.</p>
            </>
          ) : (
            <>
              <h1 style={{ fontSize: "2.2rem" }}>Cancel this appointment?</h1>
              <p className="lead" style={{ marginBottom: 20 }}>
                {a.services?.name}
                <br />
                <strong style={{ color: "var(--navy)" }}>
                  {formatDate(a.start_at)}, {formatTime(a.start_at)}
                </strong>
              </p>
              <TokenAction
                endpoint="/api/bookings/cancel"
                token={token}
                label="Yes, cancel it"
                doneTitle="Appointment cancelled"
                doneBody="We have let your plumber know. You are welcome to book another time whenever you are ready."
                danger
              />
            </>
          )}
        </div>
      </div>
    </section>
  );
}
