import Link from "next/link";
import { site } from "@/content/site";

export default function Footer() {
  return (
    <footer style={{ background: "#09182f", color: "#dfe9ff", padding: "3rem 0" }}>
      <div className="container" style={{ display: "grid", gap: 16, gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))" }}>
        <div>
          <h3 style={{ margin: 0, color: "white" }}>{site.fullName}</h3>
          <p style={{ margin: "0.75rem 0 0" }}>{site.areaLine}</p>
        </div>
        <div>
          <p><strong>Call:</strong> <a href={`tel:${site.phoneTel}`}>{site.phoneDisplay}</a></p>
          <p><strong>Email:</strong> <a href={`mailto:${site.email}`}>{site.email}</a></p>
        </div>
        <div>
          <p style={{ marginTop: 0 }}><Link href="/appointments">Book online</Link></p>
          <p><Link href="/reviews">Reviews</Link></p>
          <p><Link href="/contact">Contact</Link></p>
        </div>
      </div>
    </footer>
  );
}
