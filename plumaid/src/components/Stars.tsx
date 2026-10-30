import { IconStar } from "./Icons";

export default function Stars({ rating, size = 20 }: { rating: number; size?: number }) {
  const r = Math.round(rating);
  return (
    <span className="stars" role="img" aria-label={`${rating.toFixed(1).replace(".0", "")} out of 5 stars`}>
      {[1, 2, 3, 4, 5].map((n) => (
        <IconStar key={n} size={size} off={n > r} />
      ))}
    </span>
  );
}
