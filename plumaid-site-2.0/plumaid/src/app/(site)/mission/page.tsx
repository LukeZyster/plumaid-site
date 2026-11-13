import type { Metadata } from "next";
import Link from "next/link";
import { mission } from "@/content/story";

export const metadata: Metadata = {
  title: "Our mission",
  description: "What PlumAid Plumbing Solutions stands for: fast, reliable, professional plumbing in Wellington and Paarl.",
};

export default function MissionPage() {
  return (
    <>
      <section className="page-hero">
        <div className="container">
          <h1>Our mission</h1>
          <p className="lead">{mission.intro}</p>
        </div>
      </section>
      <div className="pipe pipe--thin" aria-hidden="true" />

      <section className="section">
        <div className="container">
          <p className="pull">{mission.statement}</p>
        </div>
      </section>

      <section className="section section--white">
        <div className="container">
          <div className="section-head"><h2>Three promises</h2></div>
          <div className="values">
            {mission.values.map((v) => (
              <div className="value" key={v.title}>
                <h3>{v.title}</h3>
                <p>{v.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container split">
          <div>
            <h2>Who we are here for</h2>
          </div>
          <ul className="prose" style={{ paddingLeft: "1.2em" }}>
            {mission.serve.map((s) => (
              <li key={s} style={{ marginBottom: 10, color: "var(--ink-soft)" }}>{s}</li>
            ))}
          </ul>
        </div>
      </section>

      <section className="cta-band">
        <div className="container cta-inner" style={{ gridTemplateColumns: "1fr" }}>
          <div>
            <h2>See it for yourself</h2>
            <p>Book a time that suits you and judge our work by the result.</p>
            <Link href="/appointments" className="btn btn--navy">Book a plumber</Link>
          </div>
        </div>
      </section>
    </>
  );
}
