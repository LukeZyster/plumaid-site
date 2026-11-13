import type { Metadata } from "next";
import Link from "next/link";
import RespondForm from "@/components/RespondForm";
import { getByDecisionToken } from "@/lib/booking";
import { hasSupabase } from "@/lib/supabase/admin";
import { formatDate, formatTime } from "@/lib/time";

export const metadata: Metadata = { title: "Answer a booking request", robots: { index: false, follow: false } };
export const dynamic = "force-dynamic";

const STATUS_TEXT: Record<string, string> = {
  confirmed: "You already accepted this request.",
  completed: "This job is already done.",
  declined: "You already declined this request.",
  cancelled: "The customer cancelled this request.",
  expired: "This request expired because the time has passed.",
};

export default async function RespondPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string; action?: string }>;
}) {
  const { token = "", action } = await searchParams;
  const a = hasSupabase() ? await getByDecisionToken(token) : null;
  const first = (a?.customer_name ?? "").split(" ")[0] || "the customer";

  return (
    <section className="section">
      <div className="container">
        <div className="card narrow">
          {!a ? (
            <>
              <h1 style={{ fontSize: "2rem" }}>This link is not valid</h1>
              <p>Open the dashboard to see all requests.</p>
              <Link href="/admin" className="btn btn--navy">Open dashboard</Link>
            </>
          ) : a.status !== "pending" ? (
            <>
              <h1 style={{ fontSize: "2rem" }}>Already sorted</h1>
              <p className="lead">{STATUS_TEXT[a.status] ?? "This request has already been handled."}</p>
              <Link href={`/admin?d=${a.start_at.slice(0, 10)}`} className="btn btn--navy">Open dashboard</Link>
            </>
          ) : (
            <>
              <p className="eyebrow">Booking request</p>
              <h1 style={{ fontSize: "2.1rem" }}>{a.customer_name}</h1>
              <dl className="req-details">
                <div><dt>Service</dt><dd>{a.services?.name ?? "Plumbing"}</dd></div>
                <div><dt>When</dt><dd>{formatDate(a.start_at)}, {formatTime(a.start_at)} to {formatTime(a.end_at)}</dd></div>
                <div><dt>Phone</dt><dd><a href={`tel:${a.customer_phone}`}>{a.customer_phone}</a></dd></div>
                <div><dt>Email</dt><dd><a href={`mailto:${a.customer_email}`}>{a.customer_email}</a></dd></div>
                {a.address && (
                  <div>
                    <dt>Address</dt>
                    <dd>
                      <a href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(a.address)}`} target="_blank" rel="noopener">
                        {a.address}
                      </a>
                    </dd>
                  </div>
                )}
                {a.notes && <div><dt>Message</dt><dd className="req-msg">“{a.notes}”</dd></div>}
              </dl>
              <RespondForm
                endpoint="/api/bookings/respond"
                token={token}
                initialAction={action === "decline" ? "decline" : "accept"}
                customerFirstName={first}
                when={`${formatDate(a.start_at, { weekday: "long", day: "numeric", month: "long", year: undefined })} at ${formatTime(a.start_at)}`}
              />
            </>
          )}
        </div>
      </div>
    </section>
  );
}
