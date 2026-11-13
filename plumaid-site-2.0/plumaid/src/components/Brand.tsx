export function Mascot({ size = 80, className = "" }: { size?: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 120 120" className={className} aria-label="PlumAid mascot" role="img">
      <circle cx="60" cy="60" r="52" fill="#dfeeff" />
      <path d="M36 68c0-15 12-27 27-27s27 12 27 27v10H36V68Z" fill="#1d3f75" />
      <circle cx="45" cy="48" r="5" fill="#1d3f75" />
      <circle cx="76" cy="48" r="5" fill="#1d3f75" />
      <path d="M48 66c6 6 18 6 24 0" stroke="#1d3f75" strokeWidth="4" strokeLinecap="round" fill="none" />
      <path d="M28 95h64" stroke="#1d3f75" strokeWidth="6" strokeLinecap="round" />
    </svg>
  );
}
