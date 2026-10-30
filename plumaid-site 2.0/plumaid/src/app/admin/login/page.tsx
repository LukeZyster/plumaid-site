import type { Metadata } from "next";
import Link from "next/link";
import { DropWrench } from "@/components/Brand";
import LoginForm from "@/components/admin/LoginForm";

export const metadata: Metadata = { title: "Plumber sign in", robots: { index: false, follow: false } };

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ denied?: string }> }) {
  const { denied } = await searchParams;
  return (
    <main className="adm-login">
      <div className="card narrow adm-login-card">
        <DropWrench size={56} />
        <h1>Plumber sign in</h1>
        <p className="hint">PlumAid admin. Appointments, calendar, photos and reviews.</p>
        {denied && (
          <p className="alert alert--bad" role="alert">
            That account isn&apos;t allowed in. Sign in with the plumber&apos;s email.
          </p>
        )}
        <LoginForm />
        <p className="hint">
          <Link href="/">← Back to the website</Link>
        </p>
      </div>
    </main>
  );
}
