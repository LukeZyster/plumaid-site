import MediaManager from "@/components/admin/MediaManager";
import { db } from "@/lib/supabase/admin";
import type { MediaItem } from "@/lib/types";

export default async function AdminMedia() {
  const { data } = await db()
    .from("media_items")
    .select("*")
    .order("sort_order")
    .order("created_at", { ascending: false });
  return (
    <>
      <h1 className="adm-title">Photos &amp; videos</h1>
      <p className="lead">
        Add, hide or delete anything on the site. Hero = the big picture at the top of the home page (the first one in its list is shown). Completed jobs play in the home-page carousel in the order you set here: drag them, or use the arrows. Team and business photos appear in the gallery.
      </p>
      <MediaManager items={(data as MediaItem[]) ?? []} />
    </>
  );
}
