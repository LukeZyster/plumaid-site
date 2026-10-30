import ReviewToggle from "@/components/admin/ReviewToggle";
import Stars from "@/components/Stars";
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
        Customers get a review link by email after you mark their job done. Reviews go live straight away. Hide any you don&apos;t want shown.
      </p>
      {reviews.length === 0 ? (
        <p className="empty">No reviews yet. They appear here after customers respond to the email.</p>
      ) : (
        <ul className="adm-list">
          {reviews.map((r) => (
            <li key={r.id} className={`adm-appt ${r.published ? "" : "adm-appt--hidden"}`}>
              <div className="adm-appt-time">
                <Stars rating={r.rating} size={18} />
              </div>
              <div className="adm-appt-body">
                <div className="adm-appt-top">
                  <h3>{r.reviewer_name}</h3>
                  <span className={`chip ${r.published ? "chip--confirmed" : "chip--blocked"}`}>{r.published ? "Showing" : "Hidden"}</span>
                </div>
                <p>{r.comment || <em>(No written comment)</em>}</p>
                <p className="hint">{formatDate(r.created_at, { weekday: undefined })}</p>
                <ReviewToggle id={r.id} published={r.published} />
              </div>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
