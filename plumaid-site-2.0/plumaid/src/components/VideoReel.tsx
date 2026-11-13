export default function VideoReel({ items = [] }: { items: Array<{ id: string; public_url: string; title?: string | null; caption?: string | null }> }) {
  if (!items.length) return <p>No recent jobs yet.</p>;
  return (
    <div style={{ display: "grid", gap: 16, gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))" }}>
      {items.map((item) => (
        <div key={item.id} style={{ background: "#f2f7ff", borderRadius: 16, overflow: "hidden" }}>
          <video src={item.public_url} controls style={{ width: "100%", display: "block", maxHeight: 240 }} />
          <div style={{ padding: 12 }}>
            <strong>{item.title || "Recent job"}</strong>
            {item.caption ? <div>{item.caption}</div> : null}
          </div>
        </div>
      ))}
    </div>
  );
}
