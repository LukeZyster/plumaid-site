export type MediaItem = {
  id: string;
  kind: "video" | "photo";
  category: "job" | "team" | "business";
  public_url: string;
  title: string | null;
  caption: string | null;
  published: boolean;
  sort_order: number;
  created_at: string;
};

export type Review = {
  id: string;
  rating: number;
  reviewer_name: string;
  comment: string | null;
  published: boolean;
  created_at: string;
};
