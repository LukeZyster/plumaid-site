import AddReviewForm from "@/components/admin/AddReviewForm";
import ReviewToggle from "@/components/admin/ReviewToggle";
import Stars from "@/components/Stars";
import { displayName, SOURCE_LABEL } from "@/lib/reviews";
import { db } from "@/lib/supabase/admin";
import { formatDate } from "@/lib/time";
import type { Review } from "@/lib/types";

export default async function AdminReviews() {
  const { data } = await db().from("reviews").select("*").order("created_at", { ascending: false });
  const reviews = (data as Review[]) ?? [];
  return (
    <>
      <h1 className="adm-title">Reviews</h1>
      <p className="lead">
        Customers get a review link by email when you mark their job done, and those reviews go live straight away. You can also add
        reviews you received on WhatsApp, Facebook, Google or in person. Hide anything you don&apos;t want shown.
      </p>
      <div className="adm-reviews">
        <AddReviewForm />
        <div>
          <h2 className="adm-h" style={{ marginTop: 0 }}>All reviews ({reviews.length})</h2>
          {reviews.length === 0 ? (
            <p className="empty">No reviews yet. Add one on the left, or they arrive after customers respond to the email.</p>
          ) : (
            <ul className="adm-list">
              {reviews.map((r) => (
                <li key={r.id} className={`adm-appt adm-review ${r.published ? "" : "adm-appt--hidden"}`}>
                  <div className="adm-appt-time adm-review-stars">
                    <strong>{r.rating}.0</strong>
                    <Stars rating={r.rating} size={14} />
                  </div>
                  <div className="adm-appt-body">
                    <div className="adm-appt-top">
                      <h3>{displayName(r)}</h3>
                      <span className={`chip ${r.published ? "chip--confirmed" : "chip--blocked"}`}>{r.published ? "Showing" : "Hidden"}</span>
                    </div>
                    <p className="hint">
                      {SOURCE_LABEL[r.source ?? "website"]} · {formatDate(r.review_date ?? r.created_at, { weekday: undefined })}
                    </p>
                    {r.comment && <p>“{r.comment}”</p>}
                    {r.screenshot_url && (
                      <a href={r.screenshot_url} target="_blank" rel="noopener" className="adm-review-thumb">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={r.screenshot_url} alt="Review screenshot" loading="lazy" />
                      </a>
                    )}
                    <ReviewToggle id={r.id} published={r.published} canDelete={!r.appointment_id} />
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </>
  );
}
