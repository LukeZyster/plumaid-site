/**
 * Icons: Lucide (https://lucide.dev), a hand-drawn, consistent open-source icon set,
 * plus the official WhatsApp glyph. Wrapped so the rest of the site keeps the same names.
 */
import {
  ArrowRight,
  Check,
  ChevronLeft,
  ChevronRight,
  Clock,
  Droplets,
  Heater,
  House,
  Mail,
  MapPin,
  Pause,
  Phone,
  Play,
  ShieldCheck,
  Wrench,
  type LucideIcon,
} from "lucide-react";

type P = { size?: number; className?: string };

const wrap = (Icon: LucideIcon, defaultSize: number, strokeWidth = 2, fill?: boolean) =>
  function Wrapped({ size = defaultSize, className }: P) {
    return (
      <Icon
        size={size}
        className={className}
        strokeWidth={strokeWidth}
        aria-hidden="true"
        {...(fill ? { fill: "currentColor" } : {})}
      />
    );
  };

export const IconWrench = wrap(Wrench, 32, 1.9);
export const IconGeyser = wrap(Heater, 32, 1.9);
export const IconPipe = wrap(Droplets, 32, 1.9);
export const IconHome = wrap(House, 32, 1.9);
export const IconShield = wrap(ShieldCheck, 20);
export const IconPhone = wrap(Phone, 22);
export const IconMail = wrap(Mail, 22);
export const IconPin = wrap(MapPin, 22);
export const IconClock = wrap(Clock, 22);
export const IconCheck = wrap(Check, 20, 2.5);
export const IconArrow = wrap(ArrowRight, 20, 2.25);
export const IconPlay = wrap(Play, 20, 2, true);
export const IconPause = wrap(Pause, 20, 2, true);
export const IconPrev = wrap(ChevronLeft, 20, 2.5);
export const IconNext = wrap(ChevronRight, 20, 2.5);

export const IconStar = ({ size = 20, className, off = false }: P & { off?: boolean }) => (
  <svg className={`${className ?? ""} ${off ? "off" : ""}`} width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <path d="m12 2.5 2.9 6 6.6.9-4.8 4.6 1.2 6.5L12 17.4 6.1 20.5l1.2-6.5L2.5 9.4l6.6-.9Z" />
  </svg>
);

export const IconWhatsApp = ({ size = 24, className }: P) => (
  <svg className={className} width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <path d="M12.04 2a9.9 9.9 0 0 0-8.5 14.9L2 22l5.25-1.37A9.9 9.9 0 1 0 12.04 2Zm0 18.1a8.2 8.2 0 0 1-4.2-1.15l-.3-.18-3.1.8.83-3.03-.2-.31a8.2 8.2 0 1 1 6.97 3.87Zm4.5-6.15c-.25-.12-1.46-.72-1.68-.8-.23-.08-.4-.12-.56.12-.17.25-.64.8-.78.97-.14.17-.29.19-.54.06-.25-.12-1.05-.39-2-1.23-.74-.66-1.24-1.47-1.38-1.72-.15-.25-.02-.38.1-.5.12-.11.25-.29.37-.43.12-.15.17-.25.25-.41.08-.17.04-.31-.02-.43-.06-.12-.56-1.35-.77-1.85-.2-.48-.4-.42-.56-.43h-.48c-.17 0-.43.06-.66.31-.23.25-.87.85-.87 2.07 0 1.22.89 2.4 1.01 2.56.12.17 1.75 2.67 4.23 3.74.59.26 1.05.41 1.41.52.6.19 1.13.16 1.56.1.48-.07 1.46-.6 1.67-1.18.2-.58.2-1.07.14-1.18-.06-.1-.23-.17-.48-.29Z" />
  </svg>
);
