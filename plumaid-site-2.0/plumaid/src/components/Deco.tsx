import { Bath, Bolt, Droplet, Gauge, HardHat, Hammer, Nut, Ruler, ShowerHead, Toolbox, Wrench, type LucideIcon } from "lucide-react";

/**
 * Faint, hand-placed plumbing doodles behind a section (never the same twice).
 * Each preset is a small, deliberate arrangement of different tools: not a repeating pattern.
 */
type Item = {
  I: LucideIcon;
  /** CSS position, e.g. { top: "8%", right: "4%" } */
  at: Partial<Record<"top" | "right" | "bottom" | "left", string>>;
  size: number;
  rotate?: number;
  tone?: "navy" | "blue" | "copper" | "orange" | "light";
  /** gentle float; seconds per cycle (omit for static) */
  float?: number;
};

const PRESETS: Record<string, Item[]> = {
  services: [
    { I: Toolbox, at: { top: "6%", right: "5%" }, size: 96, rotate: -8, tone: "copper", float: 9 },
    { I: Droplet, at: { top: "38%", right: "1.5%" }, size: 34, rotate: 12, tone: "blue", float: 6 },
    { I: Nut, at: { bottom: "8%", left: "1.5%" }, size: 46, rotate: 18, tone: "navy" },
  ],
  calendar: [
    { I: Ruler, at: { top: "10%", left: "2%" }, size: 90, rotate: -32, tone: "copper" },
    { I: Bolt, at: { bottom: "10%", right: "3%" }, size: 44, rotate: 20, tone: "navy", float: 8 },
  ],
  jobs: [
    { I: HardHat, at: { top: "8%", right: "4%" }, size: 82, rotate: 10, tone: "orange", float: 10 },
    { I: Hammer, at: { bottom: "6%", left: "2%" }, size: 70, rotate: -24, tone: "navy" },
  ],
  team: [
    { I: ShowerHead, at: { top: "10%", right: "6%" }, size: 74, rotate: -10, tone: "blue", float: 9 },
    { I: Droplet, at: { top: "30%", right: "4.5%" }, size: 22, tone: "blue", float: 5 },
    { I: Wrench, at: { bottom: "10%", left: "3%" }, size: 64, rotate: 35, tone: "copper" },
  ],
  reviews: [
    { I: Bath, at: { bottom: "8%", right: "4%" }, size: 92, rotate: -6, tone: "blue" },
    { I: Gauge, at: { top: "12%", left: "2%" }, size: 52, rotate: 8, tone: "copper", float: 11 },
  ],
  page1: [
    { I: Wrench, at: { top: "18%", right: "6%" }, size: 88, rotate: 25, tone: "light", float: 10 },
    { I: Droplet, at: { bottom: "16%", right: "18%" }, size: 30, tone: "light", float: 6 },
  ],
  page2: [
    { I: Toolbox, at: { bottom: "14%", right: "5%" }, size: 90, rotate: -6, tone: "light" },
    { I: Nut, at: { top: "16%", right: "16%" }, size: 36, rotate: 20, tone: "light", float: 8 },
  ],
  page3: [
    { I: ShowerHead, at: { top: "14%", right: "7%" }, size: 82, rotate: -14, tone: "light", float: 9 },
    { I: Bolt, at: { bottom: "14%", right: "20%" }, size: 34, rotate: 30, tone: "light" },
  ],
  page4: [
    { I: HardHat, at: { top: "16%", right: "6%" }, size: 84, rotate: 8, tone: "light", float: 10 },
    { I: Hammer, at: { bottom: "12%", right: "19%" }, size: 46, rotate: -30, tone: "light" },
  ],
};

export default function Deco({ preset }: { preset: keyof typeof PRESETS | string }) {
  const items = PRESETS[preset] ?? [];
  return (
    <div className="deco" aria-hidden="true">
      {items.map(({ I, at, size, rotate = 0, tone = "navy", float }, i) => (
        <span
          key={i}
          className={`deco-i deco--${tone} ${float ? "deco-float" : ""}`}
          style={{ ...at, width: size, height: size, ["--r" as string]: `${rotate}deg`, ["--d" as string]: `${float ?? 0}s` }}
        >
          <I size={size} strokeWidth={1.25} />
        </span>
      ))}
    </div>
  );
}
