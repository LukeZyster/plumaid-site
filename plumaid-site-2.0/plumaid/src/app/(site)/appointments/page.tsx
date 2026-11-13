import type { Metadata } from "next";
import BookingCalendar from "@/components/BookingCalendar";
import { hoursNote } from "@/lib/config";
import { listServices } from "@/lib/booking";
import { site, whatsappLink } from "@/content/site";
import type { Service } from "@/lib/types";
import Deco from "@/components/Deco";

export const metadata: Metadata = {
  title: "Book a plumber",
  description: "Book a PlumAid plumber online in Wellington, Paarl and surrounds. Pick a day on the calendar, send a request, and your plumber confirms it by email.",
};
export const dynamic = "force-dynamic";

export default async function AppointmentsPage({ searchParams }: { searchParams: Promise<{ service?: string }> }) {
  const { service } = await searchParams;

  let services: Service[] = [];
  try {
    services = await listServices();
  } catch {
    services = [];
  }

  return (
    <>
      <section className="page-hero">
        <Deco preset="page1" />
        <div className="container">
          <h1>Book a plumber</h1>
          <p className="lead">Tap a day on the calendar, choose a time and tell us what&apos;s wrong. Your plumber confirms by email.</p>
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
            <BookingCalendar
              services={services.map((s) => ({ slug: s.slug, name: s.name, description: s.description, duration: s.duration_minutes }))}
              initialService={service}
              hoursNote={hoursNote()}
            />
          )}
        </div>
      </section>
    </>
  );
}
