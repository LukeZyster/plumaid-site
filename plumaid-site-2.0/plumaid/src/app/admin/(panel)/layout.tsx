import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Logo } from "@/components/Brand";
import AdminNav from "@/components/admin/AdminNav";
import SignOut from "@/components/admin/SignOut";
import { getAdmin } from "@/lib/auth";

export const metadata: Metadata = { title: "Admin", robots: { index: false, follow: false } };
export const dynamic = "force-dynamic";

export default async function PanelLayout({ children }: { children: React.ReactNode }) {
  const admin = await getAdmin();
  if (!admin) redirect("/admin/login?denied=1");

  return (
    <div className="adm">
      <header className="adm-bar">
        <div className="container adm-bar-inner">
          <Link href="/admin" aria-label="Admin home">
            <Logo light size={34} />
          </Link>
          <AdminNav />
          <div className="adm-user">
            <span>{admin.email}</span>
            <SignOut />
          </div>
        </div>
      </header>
      <main className="container adm-main">{children}</main>
    </div>
  );
}
