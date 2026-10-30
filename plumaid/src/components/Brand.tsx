import { useId } from "react";

/**
 * Brand artwork, redrawn as vector from the PlumAid business card.
 * To use your original files instead, drop them in /public/brand and swap the SVG for an <img>.
 */

/** The water-drop + wrench icon that sits beside the PlumAid name. */
export function DropWrench({ size = 48, className = "" }: { size?: number; className?: string }) {
  const id = useId();
  return (
    <svg className={className} width={size} height={size} viewBox="0 0 64 64" role="img" aria-label="PlumAid">
      <defs>
        <linearGradient id={`${id}d`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#6cc4f5" />
          <stop offset="1" stopColor="#2386d4" />
        </linearGradient>
      </defs>
      {/* drop */}
      <path d="M36 3C36 3 20 20 20 31a16 16 0 0 0 32 0C52 20 36 3 36 3Z" fill={`url(#${id}d)`} />
      <path d="M28 30c0-5 3-9 6-12" stroke="#fff" strokeOpacity=".7" strokeWidth="3" strokeLinecap="round" fill="none" />
      {/* open-end wrench: handle + C-shaped jaw facing the drop */}
      <path d="M20 48L8 60" stroke="#0f1b36" strokeWidth="7.5" strokeLinecap="round" />
      <path d="M33.5 39.3A8 8 0 1 1 28.7 34.5" stroke="#0f1b36" strokeWidth="7.5" fill="none" />
      <circle cx="14" cy="54" r="2" fill="#f26a1b" />
    </svg>
  );
}

/** Wordmark: PLUM (navy) + AID (orange) + the drop icon. */
export function Logo({ light = false, size = 40 }: { light?: boolean; size?: number }) {
  return (
    <span className="logo" style={{ ["--logo-size" as string]: `${size}px` }}>
      <DropWrench size={size} />
      <span className="logo-text">
        <span className="logo-word">
          <span style={{ color: light ? "#fff" : "var(--navy)" }}>PLUM</span>
          <span style={{ color: "var(--orange)" }}>AID</span>
        </span>
        <span className="logo-sub" style={{ color: light ? "#9db3d6" : "var(--ink-soft)" }}>
          Plumbing Solutions
        </span>
      </span>
    </span>
  );
}

/** The little droplet man in a cap, thumbs up, holding a pipe wrench. */
export function Mascot({
  size = 240,
  className = "",
  wave = false,
}: {
  size?: number;
  className?: string;
  wave?: boolean;
}) {
  const id = useId();
  return (
    <svg
      className={className}
      width={size}
      height={(size * 250) / 200}
      viewBox="0 0 200 250"
      role="img"
      aria-label="PlumAid mascot giving a thumbs up"
    >
      <defs>
        <linearGradient id={`${id}b`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#5fbdf2" />
          <stop offset="1" stopColor="#1f7fcd" />
        </linearGradient>
        <linearGradient id={`${id}w`} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#d8431c" />
          <stop offset="1" stopColor="#f26a1b" />
        </linearGradient>
      </defs>
      {/* ground shadow */}
      <ellipse cx="100" cy="238" rx="52" ry="7" fill="#0f1b36" opacity=".22" />
      {/* legs + boots */}
      <rect x="78" y="196" width="18" height="30" rx="6" fill="#16264a" />
      <rect x="104" y="196" width="18" height="30" rx="6" fill="#16264a" />
      <path d="M72 226h28v8a4 4 0 0 1-4 4H74a4 4 0 0 1-4-4v-4a4 4 0 0 1 2-4Z" fill="#0b1328" />
      <path d="M100 226h28a4 4 0 0 1 2 4v4a4 4 0 0 1-4 4h-22a4 4 0 0 1-4-4Z" fill="#0b1328" />
      {/* torso */}
      <path d="M62 140c0-8 8-14 18-14h40c10 0 18 6 18 14v62c0 4-3 6-6 6H68c-3 0-6-2-6-6Z" fill="#16264a" />
      <path d="M62 150h8v52h-8Z M130 150h8v52h-8Z" fill="#f26a1b" />
      <rect x="62" y="186" width="76" height="10" fill="#0b1328" />
      <rect x="92" y="184" width="16" height="14" rx="3" fill="#f26a1b" />
      {/* chest drop badge */}
      <path d="M100 150c0 0-9 9-9 15a9 9 0 0 0 18 0c0-6-9-15-9-15Z" fill="#5fbdf2" />
      {/* left arm (viewer right): thumbs up */}
      <g className={wave ? "mascot-arm" : undefined} style={{ transformOrigin: "138px 150px" }}>
        <path d="M134 148c14-2 26 4 30 16l4 10-14 5-8-12-12-3Z" fill="#16264a" />
        <rect x="158" y="164" width="26" height="24" rx="11" fill={`url(#${id}b)`} />
        <rect x="167" y="142" width="11" height="28" rx="5.5" fill={`url(#${id}b)`} />
        <rect x="159" y="173" width="24" height="3" rx="1.5" fill="#1f7fcd" opacity=".5" />
      </g>
      {/* right arm (viewer left): wrench */}
      <path d="M66 148c-12 2-20 10-22 22l-2 12 14 3 4-14 8-8Z" fill="#16264a" />
      <circle cx="46" cy="186" r="12" fill={`url(#${id}b)`} />
      <g transform="rotate(-28 40 150)">
        <rect x="34" y="102" width="12" height="104" rx="5" fill={`url(#${id}w)`} />
        <path d="M26 108V90a5 5 0 0 1 5-5h5v12h8V85h5a5 5 0 0 1 5 5v18Z" fill="#c43a14" />
        <rect x="34" y="102" width="12" height="8" fill="#8a2a0e" opacity=".5" />
      </g>
      {/* head: a droplet */}
      <path
        d="M100 50c0 0-50 28-50 58a50 50 0 0 0 100 0c0-30-50-58-50-58Z"
        fill={`url(#${id}b)`}
      />
      <path d="M62 100c2-16 10-28 20-38" stroke="#fff" strokeOpacity=".55" strokeWidth="6" strokeLinecap="round" fill="none" />
      {/* cap */}
      <path d="M56 80c2-24 22-38 46-38s42 14 44 38c-30-8-62-8-90 0Z" fill="#0f1b36" />
      <path d="M60 82c30-9 64-9 90 0l30 6c8 2 8 8 0 9-20 2-40-2-62-4-20-2-42-2-58-4-5-1-5-6 0-7Z" fill="#f26a1b" />
      <rect x="86" y="54" width="30" height="14" rx="4" fill="#fff" opacity=".95" />
      <path d="M94 61h14" stroke="#0f1b36" strokeWidth="2.6" strokeLinecap="round" />
      {/* face */}
      <ellipse cx="82" cy="108" rx="11" ry="13" fill="#fff" />
      <ellipse cx="118" cy="108" rx="11" ry="13" fill="#fff" />
      <circle cx="85" cy="110" r="6" fill="#0f1b36" />
      <circle cx="115" cy="110" r="6" fill="#0f1b36" />
      <circle cx="87" cy="107" r="2" fill="#fff" />
      <circle cx="117" cy="107" r="2" fill="#fff" />
      <path d="M72 93c5-5 13-5 18-1M110 92c5-4 13-4 18 1" stroke="#0f1b36" strokeWidth="3" strokeLinecap="round" fill="none" />
      <path d="M84 134c10 10 22 10 32 0" stroke="#0f1b36" strokeWidth="4" strokeLinecap="round" fill="none" />
      <circle cx="68" cy="126" r="6" fill="#f7a6a0" opacity=".55" />
      <circle cx="132" cy="126" r="6" fill="#f7a6a0" opacity=".55" />
    </svg>
  );
}

/** Simple falling-water drop used by the pipe drip animation. */
export function Drop({ className = "" }: { className?: string }) {
  return (
    <svg className={className} width="14" height="20" viewBox="0 0 14 20" aria-hidden="true">
      <path d="M7 0C7 0 0 8 0 13a7 7 0 0 0 14 0C14 8 7 0 7 0Z" fill="#5fbdf2" />
    </svg>
  );
}
