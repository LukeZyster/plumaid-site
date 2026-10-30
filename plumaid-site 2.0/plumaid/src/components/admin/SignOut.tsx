"use client";
import { useRouter } from "next/navigation";
import { browserClient } from "@/lib/supabase/browser";

export default function SignOut({ className = "" }: { className?: string }) {
  const router = useRouter();
  return (
    <button
      className={className || "adm-link-btn"}
      onClick={async () => {
        await browserClient().auth.signOut();
        router.push("/admin/login");
        router.refresh();
      }}
    >
      Sign out
    </button>
  );
}
