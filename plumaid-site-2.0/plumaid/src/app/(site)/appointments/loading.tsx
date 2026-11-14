/** Placeholder calendar, shown instantly while the real one loads. */
export function CalendarSkeleton() {
  return (
    <div className="bcal-wrap" aria-busy="true">
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
  );
}

/** Shown instantly while the page loads, so the Book button feels immediate. */
export default function Loading() {
  return (
    <>
      <section className="page-hero">
        <div className="container">
          <h1>Contact us</h1>
          <p className="lead">Call, WhatsApp or send a message. For a set time, booking online is quickest.</p>
        </div>
      </section>
      <div className="pipe pipe--thin" aria-hidden="true" />
      <section className="section">
        <div className="container">
          <CalendarSkeleton />
        </div>
      </section>
    </>
  );
}
