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
