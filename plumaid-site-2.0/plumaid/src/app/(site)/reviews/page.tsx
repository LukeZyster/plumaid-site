import type { Metadata } from "next";
import Link from "next/link";
import { Mascot } from "@/components/Brand";
import Stars from "@/components/Stars";
import { getReviewStats, getReviews } from "@/lib/data";
import { formatDate } from "@/lib/time";

export const metadata: Metadata = {
  title: "Customer reviews",
  description: "Read reviews from PlumAid customers in Wellington and Paarl. Every review comes from a completed job.",
};
export const revalidate = 60;

export default async function ReviewsPage() {
  const [reviews, stats] = await Promise.all([getReviews(), getReviewStats()]);

  return (
    <>
      <section className="page-hero">
        <div className="container">
          <h1>Customer reviews</h1>
          <p className="lead">Every review here was written by a customer whose job we completed.</p>
        </div>
      </section>
      <div className="pipe pipe--thin" aria-hidden="true" />

      <section className="section">
        <div className="container">
          {stats.count > 0 && (
            <div className="rating-summary">
              <span className="rating-big">{stats.average.toFixed(1)}</span>
              <div>
                <Stars rating={stats.average} size={28} />
                <div style={{ color: "var(--ink-soft)", fontWeight: 600 }}>
                  from {stats.count} {stats.count === 1 ? "review" : "reviews"}
                </div>
              </div>
            </div>
          )}

          {reviews.length === 0 ? (
            <div className="empty">
              <Mascot size={120} className="mascot" />
              <h2 style={{ fontSize: "1.6rem" }}>No reviews yet</h2>
              <p>After each completed job we email the customer a link to review it. They will appear here.</p>
              <Link href="/appointments" className="btn btn--primary">Book a plumber</Link>
            </div>
          ) : (
            <div className="review-grid">
              {reviews.map((r) => (
                <figure className="review" key={r.id} style={{ margin: 0 }}>
                  <Stars rating={r.rating} />
                  <blockquote>{r.comment || "Great service."}</blockquote>
                  <figcaption style={{ display: "flex", justifyContent: "space-between", gap: 8, fontWeight: 700, color: "var(--navy)" }}>
                    <span>{r.reviewer_name}</span>
                    <small style={{ fontWeight: 500, color: "var(--ink-soft)" }}>
                      {formatDate(r.created_at, { weekday: undefined, day: "numeric", month: "short", year: "numeric" })}
                    </small>
                  </figcaption>
                </figure>
              ))}
            </div>
          )}

          <p className="hint" style={{ marginTop: 32, maxWidth: "60ch" }}>
            Had a job done by us? Check your email for your review link. It is sent when your plumber marks the job complete.
          </p>
        </div>
      </section>
    </>
  );
}
