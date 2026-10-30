import type { Metadata } from "next";
import Link from "next/link";
import ContactForm from "@/components/ContactForm";
import { IconMail, IconPhone, IconPin, IconWhatsApp } from "@/components/Icons";
import { site, whatsappLink } from "@/content/site";

export const metadata: Metadata = {
  title: "Contact",
  description: "Call, WhatsApp or email PlumAid Plumbing Solutions. Serving Wellington, Paarl and surrounding areas.",
};

export default function ContactPage() {
  return (
    <>
      <section className="page-hero">
        <div className="container">
          <h1>Contact us</h1>
          <p className="lead">Call, WhatsApp or send a message. For a set time, booking online is quickest.</p>
        </div>
      </section>
      <div className="pipe pipe--thin" aria-hidden="true" />

      <section className="section">
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
                  <IconMail /> <span>{site.email}<small>Email</small></span>
                </a>
              </li>
              <li>
                <div>
                  <IconPin /> <span>Wellington and Paarl<small>Serving surrounding areas</small></span>
                </div>
              </li>
            </ul>
            <p style={{ marginTop: 28 }}>
              <Link href="/appointments" className="btn btn--primary">Book a plumber online</Link>
            </p>
          </div>
          <div className="card">
            <h2 style={{ fontSize: "1.7rem" }}>Send a message</h2>
            <ContactForm />
          </div>
        </div>
      </section>
    </>
  );
}
