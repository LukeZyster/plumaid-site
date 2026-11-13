/**
 * Background animation for "Booking takes four steps":
 * a copper pipe springs a leak, a wrench comes in, tightens a clamp, the leak stops, and it loops.
 * Pure SVG + CSS (see .lf-* in globals.css). Decorative only.
 */
export default function LeakFixScene() {
  return (
    <div className="lf" aria-hidden="true">
      <svg viewBox="0 0 1200 260" preserveAspectRatio="xMidYMax slice" className="lf-svg">
        <defs>
          <linearGradient id="lfCopper" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#6b3416" />
            <stop offset=".2" stopColor="#c9783f" />
            <stop offset=".4" stopColor="#f3c49b" />
            <stop offset=".6" stopColor="#d68a52" />
            <stop offset=".85" stopColor="#a45a2c" />
            <stop offset="1" stopColor="#5c2d12" />
          </linearGradient>
          <linearGradient id="lfSteel" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#e2e6ec" />
            <stop offset="1" stopColor="#8b939f" />
          </linearGradient>
        </defs>

        {/* puddle (grows while leaking, dries when fixed) */}
        <ellipse className="lf-puddle" cx="600" cy="246" rx="120" ry="9" fill="#2f9be0" />

        {/* the pipe */}
        <rect x="-10" y="130" width="1220" height="36" fill="url(#lfCopper)" />
        {[260, 940].map((x) => (
          <g key={x}>
            <rect x={x} y="122" width="18" height="52" rx="4" fill="#8a4a24" />
            <rect x={x + 5} y="122" width="4" height="52" rx="2" fill="#f3c49b" opacity=".6" />
          </g>
        ))}
        {/* the crack */}
        <path className="lf-crack" d="M588 134 l8 9 -6 7 9 8 -5 6" fill="none" stroke="#2a1205" strokeWidth="3" strokeLinejoin="round" />

        {/* leaking water */}
        <g className="lf-leak">
          {/* spray */}
          {[
            [-1, 0],
            [-0.5, 0.2],
            [0.4, 0.45],
            [1, 0.7],
            [-0.8, 0.9],
            [0.7, 1.1],
          ].map(([dir, delay], i) => (
            <circle
              key={i}
              className="lf-spray"
              cx="598"
              cy="134"
              r={i % 2 ? 4 : 5}
              fill="#8fd0f7"
              style={{ ["--dx" as string]: `${dir * 70}px`, animationDelay: `${delay}s` }}
            />
          ))}
          {/* drips falling into the puddle */}
          {[0, 0.5, 1].map((d, i) => (
            <path
              key={i}
              className="lf-drip"
              d="M600 166c0 0-7 9-7 14a7 7 0 0 0 14 0c0-5-7-14-7-14z"
              fill="#5fbdf2"
              style={{ animationDelay: `${d}s` }}
            />
          ))}
        </g>

        {/* the repair clamp that the wrench tightens */}
        <g className="lf-clamp">
          <rect x="572" y="122" width="56" height="52" rx="8" fill="url(#lfSteel)" stroke="#5d6573" strokeWidth="2" />
          <rect x="585" y="112" width="30" height="12" rx="3" fill="#8b939f" />
          <circle cx="600" cy="118" r="5" fill="#5d6573" />
        </g>

        {/* the wrench */}
        <g className="lf-wrench-move">
          <g className="lf-wrench">
            <rect x="592" y="18" width="18" height="96" rx="8" fill="#f26a1b" />
            <rect x="596" y="40" width="10" height="44" rx="5" fill="#d9560c" />
            <path d="M584 112 v-14 a10 10 0 0 1 10 -10 h14 a10 10 0 0 1 10 10 v14 h-9 v-8 h-16 v8z" fill="url(#lfSteel)" stroke="#5d6573" strokeWidth="2" />
          </g>
        </g>

        {/* done! */}
        <g className="lf-done">
          <circle cx="672" cy="96" r="20" fill="#1fa855" />
          <path d="M662 96 l7 7 13-14" fill="none" stroke="#fff" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" />
        </g>
      </svg>
    </div>
  );
}
