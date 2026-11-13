import { MessageCircle, Quote } from "lucide-react";
import Stars from "./Stars";
import { displayName, SOURCE_LABEL } from "@/lib/reviews";
import { formatDate } from "@/lib/time";
import type { Review } from "@/lib/types";

/** One customer review: stars, their words, an optional screenshot, who and where. */
export default function ReviewCard({ r, showDate = true }: { r: Review; showDate?: boolean }) {
  const name = displayName(r);
  const initial = r.anonymous ? "?" : name.trim().charAt(0).toUpperCase();
  return (
    <figure className={`review review--${r.source ?? "website"}`} style={{ margin: 0 }}>
      <div className="review-top">
        <Stars rating={r.rating} />
        <Quote size={28} className="review-quote" aria-hidden="true" />
      </div>
      {r.comment && <blockquote>{r.comment}</blockquote>}
      {r.screenshot_url && (
        <a className="review-shot" href={r.screenshot_url} target="_blank" rel="noopener" aria-label={`Open the screenshot of ${name}'s review`}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={r.screenshot_url} alt={`Screenshot of a review from ${name}`} loading="lazy" />
        </a>
      )}
      <figcaption className="review-by">
        <span className="review-avatar" aria-hidden="true">{initial}</span>
        <span>
          <strong>{name}</strong>
          <small>
            <MessageCircle size={13} aria-hidden="true" /> {SOURCE_LABEL[r.source ?? "website"]}
            {showDate && <> · {formatDate(r.review_date ?? r.created_at, { weekday: undefined, day: "numeric", month: "short", year: "numeric" })}</>}
          </small>
        </span>
      </figcaption>
    </figure>
  );
}
