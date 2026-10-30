import type { ReactNode } from "react";

type P = { size?: number; className?: string };

const base = (size: number, children: ReactNode, className?: string, fill = "none") => (
  <svg
    className={className}
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill={fill}
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    {children}
  </svg>
);

export const IconWrench = ({ size = 32, className }: P) =>
  base(size, <path d="M14.7 6.3a4 4 0 0 0-5.4 5.1L3 17.7 6.3 21l6.3-6.3a4 4 0 0 0 5.1-5.4l-2.6 2.6-2.4-.6-.6-2.4Z" />, className);

export const IconGeyser = ({ size = 32, className }: P) =>
  base(
    size,
    <>
      <rect x="6" y="2" width="12" height="17" rx="5" />
      <path d="M12 8c1.8 2 2.4 3 2.4 4a2.4 2.4 0 0 1-4.8 0c0-1 .6-2 2.4-4Z" />
      <path d="M9 19v3M15 19v3" />
    </>,
    className,
  );

export const IconPipe = ({ size = 32, className }: P) =>
  base(
    size,
    <>
      <path d="M3 8h8a4 4 0 0 1 4 4v9" />
      <rect x="2" y="6" width="3" height="4" rx="1" />
      <rect x="13" y="19" width="4" height="3" rx="1" />
      <path d="M19 5c0 0-2 2.2-2 3.6a2 2 0 0 0 4 0C21 7.2 19 5 19 5Z" />
    </>,
    className,
  );

export const IconHome = ({ size = 32, className }: P) =>
  base(size, <><path d="M3 11 12 3l9 8" /><path d="M5 10v10h14V10" /><path d="M10 20v-6h4v6" /></>, className);

export const IconShield = ({ size = 20, className }: P) =>
  base(size, <><path d="M12 3 4 6v6c0 5 3.4 8.2 8 9 4.6-.8 8-4 8-9V6Z" /><path d="m8.5 12 2.5 2.5L15.5 10" /></>, className);

export const IconPhone = ({ size = 22, className }: P) =>
  base(size, <path d="M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2Z" />, className);

export const IconMail = ({ size = 22, className }: P) =>
  base(size, <><rect x="3" y="5" width="18" height="14" rx="2" /><path d="m3 7 9 6 9-6" /></>, className);

export const IconPin = ({ size = 22, className }: P) =>
  base(size, <><path d="M12 22s7-6.2 7-12a7 7 0 0 0-14 0c0 5.8 7 12 7 12Z" /><circle cx="12" cy="10" r="2.5" /></>, className);

export const IconClock = ({ size = 22, className }: P) =>
  base(size, <><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></>, className);

export const IconCheck = ({ size = 20, className }: P) => base(size, <path d="m5 12 5 5 9-10" />, className);

export const IconArrow = ({ size = 20, className }: P) => base(size, <path d="M5 12h14m-6-6 6 6-6 6" />, className);

export const IconPlay = ({ size = 20, className }: P) => base(size, <path d="M7 4v16l13-8Z" />, className, "currentColor");
export const IconPause = ({ size = 20, className }: P) => base(size, <><rect x="6" y="4" width="4" height="16" rx="1" /><rect x="14" y="4" width="4" height="16" rx="1" /></>, className, "currentColor");
export const IconPrev = ({ size = 20, className }: P) => base(size, <path d="m15 5-7 7 7 7" />, className);
export const IconNext = ({ size = 20, className }: P) => base(size, <path d="m9 5 7 7-7 7" />, className);

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
