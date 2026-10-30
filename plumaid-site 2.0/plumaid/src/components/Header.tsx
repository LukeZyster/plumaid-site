"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { nav } from "@/content/site";
import { Logo } from "./Brand";

export default function Header() {
  const path = usePathname();
  const [open, setOpen] = useState(false);

  useEffect(() => setOpen(false), [path]);

  const items = nav.filter((n) => n.href !== "/appointments");

  return (
    <header className="site-header">
      <div className="container header-inner">
        <Link href="/" aria-label="PlumAid Plumbing Solutions, home">
          <Logo size={42} />
        </Link>

        <nav className="nav" aria-label="Main">
          {items.map((n) => (
            <Link key={n.href} href={n.href} aria-current={path === n.href ? "page" : undefined}>
              {n.label}
            </Link>
          ))}
          <Link href="/appointments" className="btn btn--primary btn--small" aria-current={path === "/appointments" ? "page" : undefined}>
            Book a plumber
          </Link>
        </nav>

        <button
          className="menu-btn"
          aria-expanded={open}
          aria-controls="mobile-nav"
          aria-label={open ? "Close menu" : "Open menu"}
          onClick={() => setOpen((o) => !o)}
        >
          <span /><span /><span />
        </button>
      </div>
      <nav id="mobile-nav" className={`mobile-nav ${open ? "open" : ""}`} aria-label="Mobile">
        {items.map((n) => (
          <Link key={n.href} href={n.href}>{n.label}</Link>
        ))}
        <Link href="/appointments" className="btn btn--primary">Book a plumber</Link>
      </nav>
    </header>
  );
}
