import type { Metadata } from "next";
import { Suspense } from "react";
import BookingCalendar from "@/components/BookingCalendar";
import ContactForm from "@/components/ContactForm";
import { IconMail, IconPhone, IconPin, IconWhatsApp } from "@/components/Icons";
import { hoursNote } from "@/lib/config";
import { listServices } from "@/lib/booking";
import { site, whatsappLink } from "@/content/site";
import type { Service } from "@/lib/types";
import Deco from "@/components/Deco";
import { CalendarSkeleton } from "./loading";

export const metadata: Metadata = {
  title: "Book a plumber or contact us",
  description:
    "Call, WhatsApp or email PlumAid Plumbing Solutions, or book a plumber online in Wellington, Paarl and surrounds. Pick a day, send a request, and your plumber confirms by email.",
};
export const dynamic = "force-dynamic";

/** Loads the services and renders the calendar. Streams in after the contact details so the page never waits on it. */
async function Calendar({ service }: { service?: string }) {
  let services: Service[] = [];
  try {
    services = await listServices();
  } catch {
    services = [];
  }
  if (services.length === 0) {
    return (
      <div className="alert alert--info" style={{ maxWidth: 640 }}>
        Online booking is temporarily unavailable. Please call or WhatsApp{" "}
        <a href={`tel:${site.phoneTel}`}>{site.phoneDisplay}</a> and we will book you in.{" "}
        <a href={whatsappLink("Hi PlumAid, I'd like to book an appointment.")}>WhatsApp us</a>
      </div>
    );
  }
  return (
    <BookingCalendar
      services={services.map((s) => ({ slug: s.slug, name: s.name, description: s.description, duration: s.duration_minutes }))}
      initialService={service}
      hoursNote={hoursNote()}
    />
  );
}

export default async function AppointmentsPage({ searchParams }: { searchParams: Promise<{ service?: string }> }) {
  const { service } = await searchParams;

  return (
    <>
      <section className="page-hero">
        <Deco preset="page1" />
        <div className="container">
          <h1>Contact us</h1>
          <p className="lead">Call, WhatsApp or send a message. For a set time, booking online is quickest.</p>
        </div>
      </section>
      <div className="pipe pipe--thin" aria-hidden="true" />

      <section className="section contact-sec" id="contact">
        <div className="container split">
          <div>
            <ul className="contact-list">
              <li>
                <a href={`tel:${site.phoneTel}`}>
                  <IconPhone /> <span>{site.phoneDisplay}<small>Call us</small></span>
                </a>
              </li>
              <li>
                <a href={whatsappLink()} target="_blank" rel="noopener noreferrer">
                  <IconWhatsApp /> <span>WhatsApp<small>Send us a photo of the problem</small></span>
                </a>
              </li>
              <li>
                <a href={`mailto:${site.email}`}>
                  <IconMail /> <span className="contact-email">{site.email}<small>Email</small></span>
                </a>
              </li>
              <li>
                <div>
                  <IconPin /> <span>Wellington and Paarl<small>Serving surrounding areas</small></span>
                </div>
              </li>
            </ul>
            <p style={{ marginTop: 28 }}>
              <a href="#book" className="btn btn--primary">Book a plumber online</a>
            </p>
          </div>
          <div className="card">
            <h2 style={{ fontSize: "1.7rem" }}>Send a message</h2>
            <ContactForm />
          </div>
        </div>
      </section>

      <section className="section book-sec" id="book">
        <div className="container">
          <div className="sec-head">
            <h2>Book a plumber</h2>
            <p className="lead">Tap a day on the calendar, choose a time and tell us what&apos;s wrong. Your plumber confirms by email.</p>
          </div>
          <Suspense fallback={<CalendarSkeleton />}>
            <Calendar service={service} />
          </Suspense>
        </div>
      </section>
    </>
  );
}
