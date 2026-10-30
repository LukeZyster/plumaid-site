import Link from "next/link";
import { Mascot } from "@/components/Brand";

export default function NotFound() {
  return (
    <section className="section" style={{ minHeight: "70vh", display: "grid", placeItems: "center" }}>
      <div className="container" style={{ textAlign: "center" }}>
        <Mascot size={160} className="mascot" />
        <h1 style={{ fontSize: "2.6rem", marginTop: 16 }}>This page has sprung a leak</h1>
        <p className="lead" style={{ margin: "0 auto 24px" }}>We could not find what you were looking for.</p>
        <Link href="/" className="btn btn--primary">Back to home</Link>
      </div>
    </section>
  );
}
