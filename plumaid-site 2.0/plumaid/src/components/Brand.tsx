import { useId } from "react";

/**
 * Brand artwork, redrawn as vector from the PlumAid business card.
 * To use your original files instead, drop them in /public/brand and swap the SVG for an <img>.
 */

/** The water-drop + wrench icon that sits beside the PlumAid name (matches the card: blue drop in a grey open-end wrench with a navy handle). */
export function DropWrench({ size = 48, className = "" }: { size?: number; className?: string }) {
  const id = useId();
  return (
    <svg className={className} width={size} height={size} viewBox="0 0 64 64" role="img" aria-label="PlumAid">
      <defs>
        <linearGradient id={`${id}d`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#4cb8f0" />
          <stop offset="1" stopColor="#1478c4" />
        </linearGradient>
        <linearGradient id={`${id}g`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#e3e7ee" />
          <stop offset="1" stopColor="#a9b1bf" />
        </linearGradient>
      </defs>
      {/* drop sitting in the wrench jaw */}
      <path d="M38 1C38 1 28 12 28 17.5a10 10 0 0 0 20 0C48 12 38 1 38 1Z" fill={`url(#${id}d)`} stroke="#0f2d57" strokeWidth="2.2" strokeLinejoin="round" />
      <path d="M33.5 17.5c0-3.5 1.8-6.5 3.8-8.5" stroke="#fff" strokeOpacity=".85" strokeWidth="2.4" strokeLinecap="round" fill="none" />
      {/* open-end wrench */}
      <g transform="translate(27 38) rotate(32)">
        <rect x="-5.5" y="6" width="11" height="23" rx="5.5" fill="#1d4580" stroke="#0f2d57" strokeWidth="2.4" />
        <path d="M-3.2 20h6.4M0 16.8v6.4" stroke="#f26a1b" strokeWidth="2.6" strokeLinecap="round" />
        <path d="M-15 -9V4a9 9 0 0 0 9 9H6a9 9 0 0 0 9-9V-9a6 6 0 0 0-6-6H6V-1a6 6 0 0 1-12 0V-15h-3a6 6 0 0 0-6 6Z" fill={`url(#${id}g)`} stroke="#0f2d57" strokeWidth="2.4" strokeLinejoin="round" />
      </g>
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

/** The little water-drop man in a PlumAid cap and polo, thumbs up, holding a pipe wrench. */
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
  const OUT = "#0d5f9e"; // soft blue outline used on the skin
  return (
    <svg
      className={className}
      width={size}
      height={(size * 230) / 232}
      viewBox="-32 0 232 230"
      role="img"
      aria-label="PlumAid mascot giving a thumbs up"
    >
      <defs>
        <linearGradient id={`${id}b`} x1="0" y1="0" x2="0.4" y2="1">
          <stop offset="0" stopColor="#35bdf6" />
          <stop offset="1" stopColor="#1393dc" />
        </linearGradient>
        <linearGradient id={`${id}w`} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#e4572e" />
          <stop offset="1" stopColor="#b93a18" />
        </linearGradient>
        <linearGradient id={`${id}g`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#d6dbe2" />
          <stop offset="1" stopColor="#7f8896" />
        </linearGradient>
      </defs>

      {/* ground shadow */}
      <ellipse cx="104" cy="222" rx="58" ry="6" fill="#0f1b36" opacity=".18" />

      {/* ── polo shirt ── */}
      <path d="M62 160c0-8 14-12 28-12h28c14 0 28 5 30 14l4 52H58Z" fill="#1c1c24" />
      {/* neck */}
      <path d="M90 146h28l-4 18-10 8-10-8Z" fill={`url(#${id}b)`} />
      {/* orange collar */}
      <path d="M88 146l16 24-22-8Z" fill="#f26a1b" />
      <path d="M120 146l-16 24 22-8Z" fill="#f26a1b" />
      {/* chest logo */}
      <text x="104" y="192" textAnchor="middle" fontSize="8" fontWeight="800" fontStyle="italic" fontFamily="Arial, sans-serif" letterSpacing="-0.3">
        <tspan fill="#fff">PLUM</tspan><tspan fill="#f26a1b">AID</tspan>
      </text>
      {/* belt + pouches */}
      <rect x="58" y="206" width="98" height="10" fill="#33231c" />
      <rect x="98" y="205" width="14" height="12" rx="2" fill="#aab2bd" stroke="#33231c" strokeWidth="2" />
      <rect x="100.5" y="208" width="9" height="6" rx="1" fill="#33231c" />
      <rect x="60" y="208" width="30" height="20" rx="6" fill="#e8631a" />
      <rect x="118" y="208" width="34" height="20" rx="6" fill="#e8631a" />
      <path d="M64 216h22M122 216h26" stroke="#b34a10" strokeWidth="2" strokeLinecap="round" />

      {/* ── wrench arm (viewer's left) ── */}
      <path d="M68 156c-12 4-22 14-24 28l16 6c2-10 8-18 18-22Z" fill="#1c1c24" />
      <path d="M44 183l17 7-3 8-18-7Z" fill="#f26a1b" />
      <g transform="rotate(-24 42 184)">
        {/* handle */}
        <rect x="35" y="112" width="14" height="96" rx="5" fill={`url(#${id}w)`} />
        <rect x="35" y="148" width="14" height="6" fill="#8e2a10" opacity=".55" />
        {/* body / hook jaw */}
        <path d="M31 118v-22a7 7 0 0 1 7-7h14a7 7 0 0 1 7 7v22Z" fill="#c8431d" />
        <path d="M30 98v-14a8 8 0 0 1 8-8h16a6 6 0 0 1 6 6v6h-9v-3h-12v13Z" fill={`url(#${id}g)`} stroke="#5d6573" strokeWidth="1.5" />
        <rect x="52" y="90" width="9" height="11" rx="2" fill={`url(#${id}g)`} stroke="#5d6573" strokeWidth="1.5" />
        <circle cx="42" cy="200" r="3" fill="#7d2a12" />
      </g>
      {/* gloved fist over handle */}
      <g stroke={OUT} strokeWidth="2" strokeLinejoin="round">
        <rect x="26" y="168" width="40" height="30" rx="13" fill={`url(#${id}b)`} />
        <circle cx="34" cy="168" r="7" fill="#35bdf6" />
        <circle cx="47" cy="165" r="7" fill="#35bdf6" />
        <circle cx="59" cy="168" r="6.5" fill="#35bdf6" />
      </g>

      {/* ── thumbs-up arm (viewer's right) ── */}
      <g className={wave ? "mascot-arm" : undefined} style={{ transformOrigin: "146px 160px" }}>
        <path d="M140 154c14 0 24 10 26 26l-17 6c-1-10-5-16-14-20Z" fill="#1c1c24" />
        <path d="M149 178l19-5 3 9-19 6Z" fill="#f26a1b" />
        <g stroke={OUT} strokeWidth="2" strokeLinejoin="round">
          <rect x="150" y="138" width="34" height="42" rx="15" fill={`url(#${id}b)`} />
          <rect x="157" y="104" width="14" height="42" rx="7" fill={`url(#${id}b)`} />
        </g>
        <path d="M153 152h14M153 160h16M154 168h14" stroke={OUT} strokeWidth="1.6" strokeLinecap="round" opacity=".55" />
      </g>

      {/* ── head: a soft water-blob ── */}
      <path
        d="M46 98C46 60 72 42 104 42s58 20 58 56c0 36-26 56-58 56S46 134 46 98Z"
        fill={`url(#${id}b)`}
        stroke={OUT}
        strokeWidth="2.2"
      />
      <path d="M58 92c2-14 9-24 18-31" stroke="#fff" strokeOpacity=".5" strokeWidth="5" strokeLinecap="round" fill="none" />

      {/* eyebrows */}
      <path d="M68 80c6-8 17-9 26-2" stroke="#0f1b36" strokeWidth="3.6" strokeLinecap="round" fill="none" />
      <path d="M116 76c8-6 19-5 26 3" stroke="#0f1b36" strokeWidth="3.6" strokeLinecap="round" fill="none" />
      {/* eyes */}
      <ellipse cx="82" cy="100" rx="13" ry="15" fill="#fff" stroke="#0f1b36" strokeWidth="1.5" />
      <ellipse cx="127" cy="98" rx="13" ry="15" fill="#fff" stroke="#0f1b36" strokeWidth="1.5" />
      <ellipse cx="85" cy="102" rx="7" ry="8.5" fill="#1a1522" />
      <ellipse cx="130" cy="100" rx="7" ry="8.5" fill="#1a1522" />
      <circle cx="87.5" cy="98.5" r="2.6" fill="#fff" />
      <circle cx="132.5" cy="96.5" r="2.6" fill="#fff" />
      {/* nose */}
      <path d="M103 106c-4 6-2 12 5 11" stroke="#0e74b8" strokeWidth="2.6" strokeLinecap="round" fill="none" />
      {/* open smile */}
      <path d="M76 122c14 5 36 5 56-5 0 22-12 34-28 34s-28-12-28-29Z" fill="#a8241d" />
      <path d="M85 144c6-8 20-9 28-3-4 6-10 9-16 9-5 0-9-2-12-6Z" fill="#f0786a" />
      <path d="M78 123c14 5 36 5 53-5-2 8-8 12-14 14-10 3-26 1-39-9Z" fill="#fff" />
      <path d="M76 122c14 5 36 5 56-5" stroke="#0f1b36" strokeWidth="3" strokeLinecap="round" fill="none" />

      {/* ── PlumAid cap ── */}
      <path d="M48 76c0-30 24-50 58-50s52 20 52 52c-30-9-76-10-110-2Z" fill="#1c1c24" />
      <path d="M52 66c10-26 30-38 54-38" stroke="#fff" strokeOpacity=".12" strokeWidth="4" strokeLinecap="round" fill="none" />
      <circle cx="106" cy="25" r="4.5" fill="#e8631a" />
      <text x="104" y="55" textAnchor="middle" fontSize="15" fontWeight="800" fontStyle="italic" fontFamily="Arial, sans-serif" letterSpacing="-0.5" transform="rotate(-4 104 55)">
        <tspan fill="#fff">PLUM</tspan><tspan fill="#f26a1b">AID</tspan>
      </text>
      {/* brim, sweeping left */}
      <path d="M52 70C38 70 28 78 30 88c2 5 14 2 32-5 18-7 46-9 72-6l2-11c-30-4-60-4-84 4Z" fill="#f26a1b" stroke="#c4500f" strokeWidth="1.5" strokeLinejoin="round" />
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
