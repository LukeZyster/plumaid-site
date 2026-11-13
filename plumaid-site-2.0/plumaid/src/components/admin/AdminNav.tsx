"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { CalendarDays, ExternalLink, Images, Star } from "lucide-react";

const LINKS = [
  { href: "/admin", label: "Calendar", Icon: CalendarDays },
  { href: "/admin/media", label: "Photos & videos", Icon: Images },
  { href: "/admin/reviews", label: "Reviews", Icon: Star },
];

/** Admin top navigation. The current section is highlighted in orange. */
export default function AdminNav() {
  const path = usePathname();
  return (
    <nav className="adm-nav" aria-label="Admin">
      {LINKS.map(({ href, label, Icon }) => {
        const active = href === "/admin" ? path === "/admin" : path.startsWith(href);
        return (
          <Link key={href} href={href} aria-current={active ? "page" : undefined}>
            <Icon size={17} aria-hidden="true" /> {label}
          </Link>
        );
      })}
      <Link href="/" target="_blank" rel="noopener">
        <ExternalLink size={16} aria-hidden="true" /> View site
      </Link>
    </nav>
  );
}
