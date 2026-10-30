export type Service = {
  id: string;
  slug: string;
  name: string;
  description: string;
  duration_minutes: number;
  sort_order: number;
  active: boolean;
};

export type AppointmentStatus = "held" | "confirmed" | "completed" | "cancelled" | "expired" | "blocked";

export type Appointment = {
  id: string;
  service_id: string | null;
  status: AppointmentStatus;
  start_at: string;
  end_at: string;
  block_end: string;
  customer_name: string | null;
  customer_email: string | null;
  customer_phone: string | null;
  address: string | null;
  property_type: "residential" | "commercial" | null;
  notes: string | null;
  verify_token: string | null;
  review_token: string | null;
  hold_expires_at: string | null;
  verified_at: string | null;
  completed_at: string | null;
  cancelled_at: string | null;
  review_requested_at: string | null;
  google_event_id: string | null;
  created_at: string;
  services?: Pick<Service, "name" | "duration_minutes"> | null;
};

export type Review = {
  id: string;
  appointment_id: string;
  reviewer_name: string;
  rating: number;
  comment: string;
  published: boolean;
  created_at: string;
};

export type MediaItem = {
  id: string;
  kind: "video" | "photo";
  category: "job" | "team" | "business";
  title: string;
  caption: string;
  storage_path: string;
  public_url: string;
  sort_order: number;
  published: boolean;
  created_at: string;
};
