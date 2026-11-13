/** Shown instantly while the booking page loads, so buttons feel immediate. */
export default function Loading() {
  return (
    <>
      <section className="page-hero">
        <div className="container">
          <h1>Book a plumber</h1>
          <p className="lead">Loading the calendar…</p>
        </div>
      </section>
      <div className="pipe pipe--thin" aria-hidden="true" />
      <section className="section" style={{ paddingTop: "clamp(32px, 5vw, 56px)" }}>
        <div className="container bcal-wrap" aria-busy="true">
          <div className="bcal-card">
            <div className="skeleton" style={{ height: 44, borderRadius: 12, marginBottom: 16 }} />
            <div className="bcal-grid">
              {Array.from({ length: 35 }).map((_, i) => (
                <div key={i} className="bcal-day skeleton" />
              ))}
            </div>
          </div>
          <aside className="bcal-side">
            <div className="skeleton" style={{ height: 160, borderRadius: 12, opacity: 0.3 }} />
          </aside>
        </div>
      </section>
    </>
  );
}
