import "server-only";
import { db } from "./supabase/admin";
import { BOOKING } from "./config";
import { addDays, addMinutes, sastDate, toSastDateString, weekdayOf } from "./time";

export type Slot = { time: string; start: string; available: boolean };

const LIVE = ["held", "confirmed", "completed", "blocked"];

/** SAST is a fixed UTC+2, so the wall-clock time is simple arithmetic. */
function sastHHMM(d: Date): string {
  const mins = (Math.floor(d.getTime() / 60_000) + 120) % 1440;
  return `${String(Math.floor(mins / 60)).padStart(2, "0")}:${String(mins % 60).padStart(2, "0")}`;
}

/** Is this "YYYY-MM-DD" a day the business is open and inside the booking window? */
export function isBookableDay(date: string, now = new Date()): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) return false;
  if (!BOOKING.hours[weekdayOf(date)]) return false;
  const today = toSastDateString(now);
  return date >= today && date <= addDays(today, BOOKING.maxAdvanceDays);
}

/**
 * All start-time slots for a date + job duration, flagged available/taken.
 * The database exclusion constraint is the final authority; this is for showing choices.
 */
export async function getSlots(date: string, durationMinutes: number, now = new Date()): Promise<Slot[]> {
  if (!isBookableDay(date, now)) return [];
  const [open, close] = BOOKING.hours[weekdayOf(date)];
  const dayOpen = sastDate(date, open);
  const dayClose = sastDate(date, close);

  // Everything that could overlap this day (including its buffer tail).
  const windowStart = addMinutes(dayOpen, -24 * 60);
  const windowEnd = addMinutes(dayClose, 24 * 60);
  const { data, error } = await db()
    .from("appointments")
    .select("start_at, block_end, status, hold_expires_at")
    .in("status", LIVE)
    .lt("start_at", windowEnd.toISOString())
    .gt("block_end", windowStart.toISOString());
  if (error) throw error;

  const occupied = (data ?? [])
    .filter((r) => !(r.status === "held" && r.hold_expires_at && new Date(r.hold_expires_at) < now))
    .map((r) => ({ start: new Date(r.start_at).getTime(), end: new Date(r.block_end).getTime() }));

  const earliest = addMinutes(now, BOOKING.minNoticeHours * 60).getTime();
  const slots: Slot[] = [];

  for (let s = dayOpen; ; s = addMinutes(s, BOOKING.slotStepMinutes)) {
    const end = addMinutes(s, durationMinutes);
    if (end > dayClose) break;
    const blockEnd = addMinutes(end, BOOKING.bufferMinutes).getTime();
    const free =
      s.getTime() >= earliest && !occupied.some((o) => s.getTime() < o.end && blockEnd > o.start);
    slots.push({ time: sastHHMM(s), start: s.toISOString(), available: free });
  }
  return slots;
}
