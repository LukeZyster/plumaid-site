import { Drop, Mascot } from "./Brand";

const COPPER_STOPS = (
  <>
    <stop offset="0" stopColor="#6b3416" />
    <stop offset=".18" stopColor="#c9783f" />
    <stop offset=".36" stopColor="#f6cfa8" />
    <stop offset=".55" stopColor="#d68a52" />
    <stop offset=".8" stopColor="#a45a2c" />
    <stop offset="1" stopColor="#5c2d12" />
  </>
);

/** Mascot + a copper pipe with a single drip. The drip lands in a puddle beside him. */
export default function HeroArt() {
  return (
    <div className="hero-art">
      <svg className="hero-pipe" viewBox="0 0 300 300" aria-hidden="true">
        <defs>
          <linearGradient id="pipeH" x1="0" y1="0" x2="0" y2="1">{COPPER_STOPS}</linearGradient>
          <linearGradient id="pipeV" x1="0" y1="0" x2="1" y2="0">{COPPER_STOPS}</linearGradient>
        </defs>
        {/* run entering from the right edge */}
        <rect x="90" y="22" width="220" height="30" fill="url(#pipeH)" />
        {/* unions */}
        <rect x="150" y="16" width="10" height="42" rx="3" fill="#8a4a24" />
        <rect x="153" y="16" width="3" height="42" rx="1.5" fill="#f3c49b" opacity=".7" />
        <rect x="236" y="16" width="10" height="42" rx="3" fill="#8a4a24" />
        <rect x="239" y="16" width="3" height="42" rx="1.5" fill="#f3c49b" opacity=".7" />
        {/* elbow */}
        <rect x="52" y="14" width="52" height="46" rx="15" fill="url(#pipeH)" />
        {/* leg */}
        <rect x="52" y="48" width="30" height="196" fill="url(#pipeV)" />
        <rect x="47" y="104" width="40" height="9" rx="3" fill="#8a4a24" />
        <rect x="47" y="104" width="40" height="3" rx="1.5" fill="#f3c49b" opacity=".55" />
        {/* open end */}
        <rect x="46" y="238" width="42" height="15" rx="4" fill="#8a4a24" />
        <rect x="46" y="238" width="42" height="4" rx="2" fill="#f3c49b" opacity=".55" />
        <ellipse cx="67" cy="254" rx="13" ry="3.2" fill="#3a1b09" />
      </svg>
      <Drop className="hero-drip" />
      <span className="hero-puddle" aria-hidden="true" />
      <Mascot className="mascot" size={300} wave />
    </div>
  );
}
