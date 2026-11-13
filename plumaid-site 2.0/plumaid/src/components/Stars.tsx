export default function Stars({ rating, size = 18 }: { rating: number; size?: number }) {
  const stars = Array.from({ length: 5 }, (_, i) => i < Math.round(rating));
  return (
    <div aria-label={`Rated ${rating} out of 5`} style={{ display: "flex", gap: 2, color: "#f7b955" }}>
      {stars.map((filled, i) => (
        <span key={i} style={{ fontSize: size, lineHeight: 1 }}>{filled ? "★" : "☆"}</span>
      ))}
    </div>
  );
}
