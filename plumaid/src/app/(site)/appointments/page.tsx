import type { Metadata } from "next";
import BookingForm, { type Day } from "@/components/BookingForm";
import { BOOKING } from "@/lib/config";
import { listServices } from "@/lib/booking";
import { hasSupabase } from "@/lib/supabase/admin";
import { site, whatsappLink } from "@/content/site";
import { addDays, sastDate, toSastDateString, weekdayOf } from "@/lib/time";
import type { Service } from "@/lib/types";

export const metadata: Metadata = {
  title: "Book a plumber",
  description: "Book a PlumAid plumber online in Wellington, Paarl and surrounds. Pick a service and a time, verify by email, done.",
};
export const dynamic = "force-dynamic";

const DOW = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MON = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

const LONG_DOW = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

/** "Monday to Friday 08:00 to 17:00. Saturday 08:00 to 13:00. Closed Sunday." built from the config */
function hoursNote(): string {
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

export default async function AppointmentsPage({ searchParams }: { searchParams: Promise<{ service?: string }> }) {
  const { service } = await searchParams;

  let services: Service[] = [];
  if (hasSupabase()) {
    try {
      services = await listServices();
    } catch {
      services = [];
    }
  }

  const today = toSastDateString(new Date());
  const days: Day[] = [];
  for (let i = 0; i <= BOOKING.maxAdvanceDays; i++) {
    const date = addDays(today, i);
    if (!BOOKING.hours[weekdayOf(date)]) continue;
    const d = sastDate(date, "12:00");
    days.push({ date, dow: i === 0 ? "Today" : DOW[d.getUTCDay()], dom: d.getUTCDate(), mon: MON[d.getUTCMonth()] });
  }

  return (
    <>
      <section className="page-hero">
        <div className="container">
          <h1>Book a plumber</h1>
          <p className="lead">Choose a service, pick a time, and confirm by email. It takes about a minute.</p>
        </div>
      </section>
      <div className="pipe pipe--thin" aria-hidden="true" />
      <section className="section" style={{ paddingTop: "clamp(32px, 5vw, 56px)" }}>
        <div className="container">
          {services.length === 0 ? (
            <div className="alert alert--info" style={{ maxWidth: 640 }}>
              Online booking is temporarily unavailable. Please call or WhatsApp{" "}
              <a href={`tel:${site.phoneTel}`}>{site.phoneDisplay}</a> and we will book you in.{" "}
              <a href={whatsappLink("Hi PlumAid, I'd like to book an appointment.")}>WhatsApp us</a>
            </div>
          ) : (
            <BookingForm
              services={services.map((s) => ({ slug: s.slug, name: s.name, description: s.description, duration: s.duration_minutes }))}
              days={days}
              initialService={service}
              holdMinutes={BOOKING.holdMinutes}
              hoursNote={hoursNote()}
            />
          )}
        </div>
      </section>
    </>
  );
}
