import type { Metadata } from "next";
import Link from "next/link";
import { Logo, Mascot } from "@/components/Brand";
import { redirect } from "next/navigation";
import LoginForm from "@/components/admin/LoginForm";
import { getAdmin } from "@/lib/auth";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Plumber sign in", robots: { index: false, follow: false } };

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ denied?: string }> }) {
  const { denied } = await searchParams;
  // Already signed in? Go straight to the dashboard.
  if (!denied && (await getAdmin())) redirect("/admin");
  return (
    <main className="adm-login">
      <div className="card narrow adm-login-card">
        <Mascot size={120} className="adm-login-mascot" wave />
        <Logo size={40} />
        <h1>Plumber sign in</h1>
        <p className="hint">PlumAid admin. Appointments, calendar, photos and reviews.</p>
        {denied && (
          <p className="alert alert--bad" role="alert">
            That account isn&apos;t allowed in. Sign in with the plumber&apos;s email.
          </p>
        )}
        <LoginForm />
        <p className="hint">
          <Link href="/">Back to the website</Link>
        </p>
      </div>
    </main>
  );
}
