import type { Metadata } from "next";
import Link from "next/link";
import { Mascot } from "@/components/Brand";
import ReviewCard from "@/components/ReviewCard";
import Stars from "@/components/Stars";
import { getReviewStats, getReviews } from "@/lib/data";
import Deco from "@/components/Deco";

export const metadata: Metadata = {
  title: "Customer reviews",
  description: "Read reviews from PlumAid customers in Wellington and Paarl. Real reviews from PlumAid customers.",
};
export const revalidate = 60;

export default async function ReviewsPage() {
  const [reviews, stats] = await Promise.all([getReviews(), getReviewStats()]);

  return (
    <>
      <section className="page-hero">
        <Deco preset="page1" />
        <div className="container">
          <h1>Customer reviews</h1>
          <p className="lead">Real words from real customers around Wellington and Paarl.</p>
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
              <p>Reviews from our customers will appear here.</p>
              <Link href="/appointments#book" className="btn btn--primary">Book a plumber</Link>
            </div>
          ) : (
            <div className="review-grid">
              {reviews.map((r) => (
                <ReviewCard key={r.id} r={r} />
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
