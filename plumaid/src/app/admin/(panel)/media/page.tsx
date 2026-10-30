import MediaManager from "@/components/admin/MediaManager";
import { db } from "@/lib/supabase/admin";
import type { MediaItem } from "@/lib/types";

export default async function AdminMedia() {
  const { data } = await db()
    .from("media_items")
    .select("*")
    .order("created_at", { ascending: false });
  return (
    <>
      <h1 className="adm-title">Photos &amp; videos</h1>
      <p className="lead">
        Videos of finished jobs play in the slideshow on the home page. Photos of the plumbers and the business appear in the gallery.
      </p>
      <MediaManager items={(data as MediaItem[]) ?? []} />
    </>
  );
}
