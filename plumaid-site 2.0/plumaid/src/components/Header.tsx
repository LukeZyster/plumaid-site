import Link from "next/link";
import { nav, site } from "@/content/site";

export default function Header() {
  return (
    <header style={{ background: "#0f1b36", color: "white", borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
      <div className="container" style={{ display: "flex", alignItems: "center", justifyContent: "space-between", minHeight: 72, gap: 16 }}>
        <Link href="/" style={{ display: "flex", alignItems: "center", gap: 10, fontWeight: 800, letterSpacing: 0.2 }}>
          <span style={{ display: "inline-flex", width: 36, height: 36, borderRadius: 10, background: "#dfeeff", color: "#0f1b36", alignItems: "center", justifyContent: "center", fontSize: 18 }}>P</span>
          {site.name}
        </Link>
        <nav style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
          {nav.map((item) => (
            <Link key={item.href} href={item.href} style={{ opacity: 0.9, fontWeight: 600 }}>{item.label}</Link>
          ))}
        </nav>
      </div>
    </header>
  );
}
