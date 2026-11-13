import type { Metadata } from "next";
import Link from "next/link";
import ReviewForm from "@/components/ReviewForm";
import { getByReviewToken } from "@/lib/booking";
import { db, hasSupabase } from "@/lib/supabase/admin";

export const metadata: Metadata = { title: "Leave a review", robots: { index: false } };
export const dynamic = "force-dynamic";

export default async function ReviewPage({
  params,
  searchParams,
}: {
  params: Promise<{ token: string }>;
  searchParams: Promise<{ r?: string }>;
}) {
  const { token } = await params;
  const { r } = await searchParams;
  const appt = hasSupabase() ? await getByReviewToken(token) : null;
  const valid = appt && appt.status === "completed";

  let already = false;
  if (valid) {
    const { data } = await db().from("reviews").select("id").eq("appointment_id", appt.id).maybeSingle();
    already = Boolean(data);
  }
  const initial = Math.min(5, Math.max(0, parseInt(r ?? "0", 10) || 0));

  return (
    <section className="section">
      <div className="container">
        <div className="card narrow">
          {!valid ? (
            <>
              <h1 style={{ fontSize: "2rem" }}>This review link is not valid</h1>
              <p>Review links are sent by email once your job is complete.</p>
              <Link href="/" className="btn btn--navy">Back to home</Link>
            </>
          ) : already ? (
            <>
              <h1 style={{ fontSize: "2rem" }}>You have already reviewed this job</h1>
              <p>Thank you. We really appreciate your feedback.</p>
              <Link href="/reviews" className="btn btn--navy">Read reviews</Link>
            </>
          ) : (
            <>
              <h1 style={{ fontSize: "2.2rem" }}>How did we do, {appt.customer_name?.split(" ")[0]}?</h1>
              <p className="lead" style={{ marginBottom: 24 }}>{appt.services?.name}. It takes under a minute.</p>
              <ReviewForm token={token} defaultName={appt.customer_name?.split(" ")[0] ?? ""} initialRating={initial} />
            </>
          )}
        </div>
      </div>
    </section>
  );
}
