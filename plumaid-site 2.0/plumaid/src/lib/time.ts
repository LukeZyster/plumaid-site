import { TZ, TZ_OFFSET } from "./config";

/** "2026-11-05" + "08:30" → Date (SAST) */
export function sastDate(date: string, time = "00:00"): Date {
  return new Date(`${date}T${time}:00${TZ_OFFSET}`);
}

/** Date → "YYYY-MM-DD" in SAST */
export function toSastDateString(d: Date): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: TZ,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(d);
}

/** Weekday (0–6) of a "YYYY-MM-DD" string */
export function weekdayOf(date: string): number {
  return new Date(`${date}T12:00:00${TZ_OFFSET}`).getUTCDay();
}

export function addDays(date: string, days: number): string {
  const d = sastDate(date, "12:00");
  d.setUTCDate(d.getUTCDate() + days);
  return toSastDateString(d);
}

export function addMinutes(d: Date, minutes: number): Date {
  return new Date(d.getTime() + minutes * 60_000);
}

export function formatDate(d: Date | string, opts?: Intl.DateTimeFormatOptions): string {
  return new Intl.DateTimeFormat("en-ZA", {
    timeZone: TZ,
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
    ...opts,
  }).format(typeof d === "string" ? new Date(d) : d);
}

export function formatTime(d: Date | string): string {
  return new Intl.DateTimeFormat("en-ZA", {
    timeZone: TZ,
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(typeof d === "string" ? new Date(d) : d);
}

export function formatRange(start: Date | string, end: Date | string): string {
  return `${formatDate(start)}, ${formatTime(start)} – ${formatTime(end)}`;
}
