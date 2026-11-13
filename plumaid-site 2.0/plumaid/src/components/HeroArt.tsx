export default function HeroArt() {
  return (
    <div style={{ background: "linear-gradient(135deg, #eaf3ff, #dfeeff)", borderRadius: 28, padding: "1.5rem", minHeight: 280, display: "grid", placeItems: "center", boxShadow: "0 20px 40px rgba(17, 34, 60, 0.08)" }}>
      <div style={{ width: "100%", maxWidth: 420, aspectRatio: "1.2", background: "linear-gradient(180deg, #ffffff, #edf6ff)", borderRadius: 20, border: "1px solid rgba(17,34,60,0.08)", display: "grid", placeItems: "center" }}>
        <div style={{ width: 220, height: 160, borderRadius: 18, background: "#12284d", position: "relative", boxShadow: "0 12px 24px rgba(18,40,77,0.25)" }}>
          <div style={{ position: "absolute", left: 28, top: 26, width: 68, height: 68, borderRadius: 12, background: "#73a6ff" }} />
          <div style={{ position: "absolute", right: 28, top: 26, width: 68, height: 68, borderRadius: 12, background: "#a4d0ff" }} />
          <div style={{ position: "absolute", left: 28, bottom: 28, width: 164, height: 36, borderRadius: 999, background: "#dfeeff" }} />
        </div>
      </div>
    </div>
  );
}
