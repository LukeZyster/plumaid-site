import Link from "next/link";
import HeroArt from "@/components/HeroArt";
import { Mascot } from "@/components/Brand";
import { IconArrow, IconGeyser, IconHome, IconPhone, IconPipe, IconShield, IconWhatsApp, IconWrench } from "@/components/Icons";
import QuickBook from "@/components/QuickBook";
import Stars from "@/components/Stars";
import VideoReel from "@/components/VideoReel";
import { serviceCards, site, whatsappLink } from "@/content/site";
import { getMedia, getReviewStats, getReviews } from "@/lib/data";

export const revalidate = 60;

const icons = { repairs: IconWrench, geyser: IconGeyser, pipe: IconPipe, home: IconHome } as const;

const steps = [
  { t: "Pick a time", d: "Choose the service and a slot that suits you. Times already taken are greyed out." },
  { t: "Verify your email", d: "We email you a link. One tap and your appointment is locked in." },
  { t: "We come to you", d: "Your plumber is notified and arrives in your booked window." },
  { t: "Tell us how it went", d: "When the job is done we send a short review link." },
];

const placeholderLabels = ["Meet your plumber", "Our van", "On site", "The workshop"];

export default async function Home() {
  const [videos, teamPhotos, bizPhotos, reviews, stats] = await Promise.all([
    getMedia("video", "job"),
    getMedia("photo", "team"),
    getMedia("photo", "business"),
    getReviews(3),
    getReviewStats(),
  ]);

  const photos = [...teamPhotos, ...bizPhotos].slice(0, 5);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Plumber",
    name: site.fullName,
    telephone: site.phoneTel,
    email: site.email,
    url: site.url,
    areaServed: ["Wellington", "Paarl"],
    address: { "@type": "PostalAddress", addressRegion: "Western Cape", addressCountry: "ZA" },
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <section className="hero">
        <div className="container hero-grid">
          <div>
            <h1>A plumber you can book in a minute.</h1>
            <p className="lead">PIRB-registered plumbing for homes and small businesses in Wellington, Paarl and surrounds.</p>
            <QuickBook />
            <ul className="hero-badges">
              <li><IconShield /> PIRB registered</li>
              <li><IconWhatsApp size={20} /> WhatsApp welcome</li>
              <li>{site.tagline}</li>
            </ul>
          </div>
          <HeroArt />
        </div>
      </section>

      <section className="section" id="services">
        <div className="container">
          <div className="section-head">
            <h2>What we fix</h2>
            <p>From a dripping tap to a new run of copper pipe. Choose a service to start booking.</p>
          </div>
          <div className="svc-list">
            {serviceCards.map((s) => {
              const Icon = icons[s.key];
              return (
                <Link key={s.key} href={`/appointments?service=${s.slug}`} className="svc">
                  <span className="svc-icon"><Icon size={30} /></span>
                  <h3>{s.title}</h3>
                  <p>{s.blurb}</p>
                  <span className="svc-go">Book this <IconArrow size={16} /></span>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      <section className="section section--white" id="jobs">
        <div className="container">
          <div className="section-head">
            <h2>Recent jobs</h2>
            <p>Short clips from work we have finished around Wellington and Paarl.</p>
          </div>
          <VideoReel items={videos.map((v) => ({ id: v.id, public_url: v.public_url, title: v.title, caption: v.caption }))} />
        </div>
      </section>

      <section className="section section--navy" id="how">
        <div className="container">
          <div className="section-head">
            <h2>Booking takes four steps</h2>
            <p>No phone tag. If you would still rather talk, call or WhatsApp {site.phoneDisplay}.</p>
          </div>
          <ol className="steps">
            {steps.map((s) => (
              <li className="step" key={s.t}>
                <h3>{s.t}</h3>
                <p>{s.d}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="section" id="team">
        <div className="container team-row">
          <div>
            <h2>The people behind the pipes</h2>
            <p className="lead">A local team that turns up on time, protects your floors and leaves the job tidy.</p>
            <Link href="/history" className="btn btn--ghost-dark">Read our story</Link>
          </div>
          <div className="gallery">
            {photos.length > 0 ? photos.map((p) => (
              <figure className="ph" key={p.id} style={{ margin: 0 }}>
                <img src={p.public_url} alt={p.title || "PlumAid team and business"} loading="lazy" />
                {(p.title || p.caption) && <figcaption>{p.title}{p.caption ? `: ${p.caption}` : ""}</figcaption>}
              </figure>
            )) : placeholderLabels.map((label) => (
              <div className="ph" key={label}>
                <div className="ph-empty">
                  <Mascot size={90} className="mascot" />
                  <span>{label}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="section section--white" id="reviews">
        <div className="container">
          <div className="section-head">
            <h2>What customers say</h2>
            {stats.count > 0 ? (
              <div className="rating-summary">
                <span className="rating-big">{stats.average.toFixed(1)}</span>
                <div>
                  <Stars rating={stats.average} size={26} />
                  <div style={{ color: "var(--ink-soft)", fontWeight: 600 }}>
                    from {stats.count} verified {stats.count === 1 ? "review" : "reviews"}
                  </div>
                </div>
              </div>
            ) : (
              <p>Every review comes from a customer whose job we have completed.</p>
            )}
          </div>
          {reviews.length > 0 ? (
            <>
              <div className="review-grid review-grid--3">
                {reviews.map((r) => (
                  <figure className="review" key={r.id} style={{ margin: 0 }}>
                    <Stars rating={r.rating} />
                    <blockquote>{r.comment || "Great service."}</blockquote>
                    <figcaption style={{ fontWeight: 700, color: "var(--navy)" }}>{r.reviewer_name}</figcaption>
                  </figure>
                ))}
              </div>
              <p style={{ marginTop: 28 }}>
                <Link href="/reviews" className="btn btn--ghost-dark">Read all reviews</Link>
              </p>
            </>
          ) : (
            <div className="empty">
              <Mascot size={110} className="mascot" />
              <p style={{ margin: 0 }}>Reviews will appear here after our first completed jobs.</p>
            </div>
          )}
        </div>
      </section>

      <section className="cta-band">
        <div className="container cta-inner">
          <div>
            <h2>Water where it should not be?</h2>
            <p>Book online in a minute, or call us and we will do our best to fit you in.</p>
            <div className="btn-row">
              <Link href="/appointments" className="btn btn--navy">Book a plumber</Link>
              <a href={`tel:${site.phoneTel}`} className="btn btn--ghost"><IconPhone size={20} /> {site.phoneDisplay}</a>
              <a href={whatsappLink()} className="btn btn--whatsapp" target="_blank" rel="noopener noreferrer">
                <IconWhatsApp size={20} /> WhatsApp
              </a>
            </div>
          </div>
          <Mascot size={190} className="mascot" />
        </div>
      </section>
    </>
  );
}
