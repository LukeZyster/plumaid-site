import Link from "next/link";
import { site, nav, whatsappLink } from "@/content/site";
import { Logo } from "./Brand";
import { BOOKING } from "@/lib/config";

const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
import { IconWhatsApp } from "./Icons";

export default function Footer() {
  return (
    <>
      <footer className="site-footer">
        <div className="pipe pipe--thin" aria-hidden="true" />
        <div className="container">
          <div className="footer-grid">
            <div>
              <Logo light size={44} />
              <p style={{ marginTop: 16, maxWidth: "36ch" }}>
                Honest, tidy plumbing for homes and small businesses in {site.areaLine.replace("•", "and")}.
              </p>
              <p className="tagline">{site.tagline}</p>
            </div>
            <div>
              <h4>Explore</h4>
              <ul>
                {nav.map((n) => (
                  <li key={n.href}><Link href={n.href}>{n.label}</Link></li>
                ))}
              </ul>
            </div>
            <div>
              <h4>Hours</h4>
              <ul className="footer-hours">
                {DAYS.map((d, i) => {
                  const h = BOOKING.hours[(i + 1) % 7];
                  return (
                    <li key={d}>
                      <span>{d}</span>
                      <span>{h ? `${h[0]} – ${h[1]}` : "Closed"}</span>
                    </li>
                  );
                })}
              </ul>
            </div>
            <div>
              <h4>Get in touch</h4>
              <ul>
                <li><a href={`tel:${site.phoneTel}`}>{site.phoneDisplay}</a></li>
                <li><a href={whatsappLink()} target="_blank" rel="noopener noreferrer">WhatsApp us</a></li>
                <li><a href={`mailto:${site.email}`}>{site.email}</a></li>
                <li>{site.areaLine}</li>
              </ul>
            </div>
          </div>
          <div className="footer-bottom">
            <span>© {new Date().getFullYear()} {site.fullName}. PIRB registered.</span>
            <a href="/admin/login">Staff login</a>
          </div>
        </div>
      </footer>
      <a className="wa-float" href={whatsappLink()} target="_blank" rel="noopener noreferrer" aria-label="Chat on WhatsApp">
        <IconWhatsApp />
        <span>WhatsApp</span>
      </a>
    </>
  );
}
