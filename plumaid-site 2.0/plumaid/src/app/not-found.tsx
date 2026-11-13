import Link from "next/link";

export default function NotFound() {
  return (
    <main style={{ padding: "4rem 1rem", textAlign: "center" }}>
      <h1>Page not found</h1>
      <p>The page you were looking for does not exist.</p>
      <Link href="/" className="btn btn--navy">Back home</Link>
    </main>
  );
}
