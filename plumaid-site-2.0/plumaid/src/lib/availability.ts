import "server-only";
import { db, hasSupabase } from "./supabase/admin";
import { BOOKING } from "./config";
import { addDays, addMinutes, sastDate, toSastDateString, weekdayOf } from "./time";

export type Slot = { time: string; start: string; available: boolean };

/** Statuses that take up time on the calendar (a pending request reserves its time until the plumber answers). */
export const LIVE = ["held", "pending", "confirmed", "completed", "blocked"];

type Busy = { start: number; end: number; shownEnd: number };

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

/** Everything that occupies time between two instants. */
async function loadBusy(from: Date, to: Date, now: Date): Promise<Busy[]> {
  if (!hasSupabase()) return []; // preview mode (no database yet): show opening hours only
  const { data, error } = await db()
    .from("appointments")
    .select("start_at, end_at, block_end, status, hold_expires_at")
    .in("status", LIVE)
    .lt("start_at", to.toISOString())
    .gt("block_end", from.toISOString());
  if (error) throw error;
  return (data ?? [])
    .filter((r) => !(r.status === "held" && r.hold_expires_at && new Date(r.hold_expires_at) < now))
    .filter((r) => !(r.status === "pending" && new Date(r.start_at) < now))
    .map((r) => ({
      start: new Date(r.start_at).getTime(),
      end: new Date(r.block_end).getTime(),
      shownEnd: new Date(r.end_at).getTime(),
    }));
}

/** Pure slot maths for one day. */
function slotsFor(date: string, durationMinutes: number, busy: Busy[], now: Date): Slot[] {
  if (!isBookableDay(date, now)) return [];
  const [open, close] = BOOKING.hours[weekdayOf(date)];
  const dayOpen = sastDate(date, open);
  const dayClose = sastDate(date, close);
  const earliest = addMinutes(now, BOOKING.minNoticeHours * 60).getTime();
  const slots: Slot[] = [];

  for (let s = dayOpen; ; s = addMinutes(s, BOOKING.slotStepMinutes)) {
    const end = addMinutes(s, durationMinutes);
    if (end > dayClose) break;
    const blockEnd = addMinutes(end, BOOKING.bufferMinutes).getTime();
    const free = s.getTime() >= earliest && !busy.some((o) => s.getTime() < o.end && blockEnd > o.start);
    slots.push({ time: sastHHMM(s), start: s.toISOString(), available: free });
  }
  return slots;
}

/**
 * All start-time slots for a date + job duration, flagged available/taken.
 * The database exclusion constraint is the final authority; this is for showing choices.
 */
export async function getSlots(date: string, durationMinutes: number, now = new Date()): Promise<Slot[]> {
  if (!isBookableDay(date, now)) return [];
  const busy = await loadBusy(addMinutes(sastDate(date), -24 * 60), addMinutes(sastDate(date), 48 * 60), now);
  return slotsFor(date, durationMinutes, busy, now);
}

export type DayState = "past" | "closed" | "full" | "busy" | "free" | "out";
export type Booked = { from: string; to: string };
export type MonthDay = { date: string; state: DayState; free: number; booked: Booked[]; allDay: boolean };

/** Booked windows on one day, clipped to opening hours and merged. No customer details. */
function bookedOn(date: string, busy: Busy[]): { booked: Booked[]; allDay: boolean } {
  const hours = BOOKING.hours[weekdayOf(date)];
  if (!hours) return { booked: [], allDay: false };
  const open = sastDate(date, hours[0]).getTime();
  const close = sastDate(date, hours[1]).getTime();
  const parts = busy
    .filter((b) => b.start < close && b.shownEnd > open)
    .map((b) => [Math.max(b.start, open), Math.min(b.shownEnd, close)] as [number, number])
    .sort((a, b) => a[0] - b[0]);
  const merged: [number, number][] = [];
  for (const p of parts) {
    const last = merged[merged.length - 1];
    if (last && p[0] <= last[1]) last[1] = Math.max(last[1], p[1]);
    else merged.push([...p]);
  }
  const allDay = merged.length === 1 && merged[0][0] <= open && merged[0][1] >= close;
  return {
    booked: merged.map(([a, b]) => ({ from: sastHHMM(new Date(a)), to: sastHHMM(new Date(b)) })),
    allDay,
  };
}

/**
 * Overview for the public calendar: one entry per day of the month.
 *   free  → plenty of times open
 *   busy  → some times already booked
 *   full  → nothing left
 *   closed/past/out → not bookable (closed day, in the past, or beyond the booking window)
 */
export async function getMonth(month: string, durationMinutes = 60, now = new Date()): Promise<MonthDay[]> {
  const first = `${month}-01`;
  const days: string[] = [];
  for (let d = first; d.startsWith(month); d = addDays(d, 1)) days.push(d);

  const busy = await loadBusy(addMinutes(sastDate(first), -24 * 60), addMinutes(sastDate(days[days.length - 1]), 48 * 60), now);
  const today = toSastDateString(now);
  const lastDay = addDays(today, BOOKING.maxAdvanceDays);

  return days.map((date) => {
    const { booked, allDay } = bookedOn(date, busy);
    const base = { date, free: 0, booked, allDay };
    if (date < today) return { ...base, state: "past" as const };
    if (!BOOKING.hours[weekdayOf(date)]) return { ...base, state: "closed" as const };
    if (date > lastDay) return { ...base, state: "out" as const };
    const slots = slotsFor(date, durationMinutes, busy, now);
    const free = slots.filter((s) => s.available).length;
    if (date === today && free === 0 && !booked.length) return { ...base, state: "past" as const }; // too late to book today
    const state: DayState = allDay || free === 0 ? "full" : booked.length || free < slots.length ? "busy" : "free";
    return { ...base, state, free };
  });
}
