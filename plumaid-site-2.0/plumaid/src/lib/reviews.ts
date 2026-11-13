import type { Review, ReviewSource } from "./types";

export const SOURCE_LABEL: Record<ReviewSource, string> = {
  website: "Booked online",
  whatsapp: "via WhatsApp",
  facebook: "via Facebook",
  google: "via Google",
  sms: "via SMS",
  email: "via email",
  in_person: "Said in person",
  other: "Customer review",
};

/** Name to show publicly ("Anonymous customer" when they asked not to be named). */
export const displayName = (r: Pick<Review, "reviewer_name" | "anonymous">) =>
  r.anonymous || !r.reviewer_name?.trim() ? "Anonymous customer" : r.reviewer_name;
