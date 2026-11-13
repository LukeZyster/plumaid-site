/**
 * Booking rules. Change these to match how the plumber actually works.
 * All times are South African Standard Time (UTC+2, no daylight saving).
 */
export const BOOKING = {
  /** weekday (0 = Sunday … 6 = Saturday) → [open, close] in 24h "HH:MM". Missing = closed. */
  hours: {
    1: ["08:00", "17:00"],
    2: ["08:00", "17:00"],
    3: ["08:00", "17:00"],
    4: ["08:00", "17:00"],
    5: ["08:00", "17:00"],
    6: ["08:00", "13:00"],
  } as Record<number, [string, string]>,
  /** Start times are offered every N minutes */
  slotStepMinutes: 30,
  /** Travel / clean-up time kept free after every job */
  bufferMinutes: 30,
  /** Customers can't book sooner than this from now */
  minNoticeHours: 3,
  /** How far ahead customers can book */
  maxAdvanceDays: 45,
  /** An unverified booking holds its slot for this long */
  holdMinutes: 60,
};

export const TZ = "Africa/Johannesburg";
export const TZ_OFFSET = "+02:00";

const LONG_DOW = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

/** "Monday to Friday 08:00 to 17:00. Saturday 08:00 to 13:00. Closed Sunday." built from the config */
export function hoursNote(): string {
  const parts: string[] = [];
  const open = Object.keys(BOOKING.hours).map(Number).sort((a, b) => a - b);
  let i = 0;
  while (i < open.length) {
    let j = i;
    while (j + 1 < open.length && open[j + 1] === open[j] + 1 && BOOKING.hours[open[j + 1]].join() === BOOKING.hours[open[i]].join()) j++;
    const [a, b] = BOOKING.hours[open[i]];
    const days = i === j ? LONG_DOW[open[i]] : `${LONG_DOW[open[i]]} to ${LONG_DOW[open[j]]}`;
    parts.push(`${days} ${a} to ${b}`);
    i = j + 1;
  }
  const closed = LONG_DOW.filter((_, d) => !BOOKING.hours[d]);
  return `${parts.join(". ")}.${closed.length ? ` Closed ${closed.join(" and ")}.` : ""}`;
}
