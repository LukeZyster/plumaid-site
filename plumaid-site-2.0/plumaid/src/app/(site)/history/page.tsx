import type { Metadata } from "next";
import Link from "next/link";
import { Mascot } from "@/components/Brand";
import { story } from "@/content/story";
import Deco from "@/components/Deco";

export const metadata: Metadata = {
  title: "Our story",
  description: "The story of PlumAid Plumbing Solutions, local plumbers serving Wellington, Paarl and surrounds.",
};

export default function HistoryPage() {
  return (
    <>
      <section className="page-hero">
        <Deco preset="page2" />
        <div className="container">
          <h1>Our story</h1>
          <p className="lead">{story.headline}</p>
        </div>
      </section>
      <div className="pipe pipe--thin" aria-hidden="true" />

      <section className="section">
        <div className="container split">
          <div className="prose">
            <p className="lead" style={{ color: "var(--navy)", fontWeight: 600 }}>{story.intro}</p>
            {story.body.map((p) => <p key={p}>{p}</p>)}
            <p style={{ marginTop: 28 }}>
              <Link href="/appointments#book" className="btn btn--primary">Book a plumber</Link>
            </p>
          </div>
          <div style={{ display: "grid", placeItems: "center", padding: 24 }}>
            <Mascot size={260} className="mascot" wave />
          </div>
        </div>
      </section>

      <section className="section section--white">
        <div className="container">
          <div className="section-head"><h2>How we got here</h2></div>
          <ol className="timeline">
            {story.milestones.map((m) => (
              <li key={m.title}>
                <h3>{m.title}</h3>
                <p>{m.text}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>
    </>
  );
}
