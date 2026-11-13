import "server-only";
import nodemailer from "nodemailer";
import { site } from "@/content/site";
import { buildIcs } from "./ics";
import { formatDate, formatTime } from "./time";
import type { Appointment } from "./types";

const BRAND = { ok: "#138a52", bad: "#c62f2f", navy: "#14213d", orange: "#f26a1b", sky: "#2f9be0", ink: "#1b2233", muted: "#5b6578", line: "#e6e9f0", bg: "#f4f6fb" };

let transport: ReturnType<typeof nodemailer.createTransport> | null = null;
function mailer() {
  if (!process.env.SMTP_HOST || !process.env.SMTP_USER || !process.env.SMTP_PASS) {
    throw new Error("Email is not configured (SMTP_HOST / SMTP_USER / SMTP_PASS).");
  }
  const port = Number(process.env.SMTP_PORT ?? 465);
  transport ??= nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port,
    secure: port === 465,
    auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
  });
  return transport;
}

export const esc = (s: unknown) =>
  String(s ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");

type SendArgs = {
  to: string;
  subject: string;
  html: string;
  text: string;
  replyTo?: string;
  ics?: string;
};

async function send({ to, subject, html, text, replyTo, ics }: SendArgs) {
  await mailer().sendMail({
    from: process.env.EMAIL_FROM ?? `PlumAid Plumbing <${process.env.SMTP_USER}>`,
    to,
    replyTo,
    subject,
    html,
    text,
    ...(ics ? { icalEvent: { method: "PUBLISH", filename: "plumaid-appointment.ics", content: ics } } : {}),
  });
}

function layout(preheader: string, heading: string, body: string) {
  return `<!doctype html><html><body style="margin:0;padding:0;background:${BRAND.bg};font-family:Segoe UI,Helvetica,Arial,sans-serif;color:${BRAND.ink};">
<span style="display:none;max-height:0;overflow:hidden;opacity:0;">${esc(preheader)}</span>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:${BRAND.bg};padding:28px 12px;"><tr><td align="center">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;background:#ffffff;border-radius:18px;overflow:hidden;border:1px solid ${BRAND.line};">
<tr><td style="background:${BRAND.navy};padding:22px 28px;">
  <span style="font-size:26px;font-weight:900;letter-spacing:-0.5px;color:#fff;">PLUM</span><span style="font-size:26px;font-weight:900;letter-spacing:-0.5px;color:${BRAND.orange};">AID</span>
  <div style="font-size:11px;letter-spacing:2px;color:#9fb0d0;margin-top:2px;text-transform:uppercase;">Plumbing Solutions · Wellington · Paarl &amp; Surrounds</div>
</td></tr>
<tr><td style="height:4px;background:linear-gradient(90deg,${BRAND.orange},${BRAND.sky});font-size:0;line-height:0;">&nbsp;</td></tr>
<tr><td style="padding:30px 28px 8px;"><h1 style="margin:0 0 14px;font-size:24px;line-height:1.25;color:${BRAND.navy};">${heading}</h1>${body}</td></tr>
<tr><td style="padding:18px 28px 28px;font-size:13px;color:${BRAND.muted};border-top:1px solid ${BRAND.line};">
  Questions? Call or WhatsApp <a href="tel:${site.phoneTel}" style="color:${BRAND.navy};font-weight:600;">${site.phoneDisplay}</a> · <a href="mailto:${site.email}" style="color:${BRAND.navy};">${site.email}</a><br>
  <span style="color:${BRAND.orange};font-weight:600;">${site.tagline}</span> · PIRB registered
</td></tr></table></td></tr></table></body></html>`;
}

const button = (href: string, label: string, color = BRAND.orange) =>
  `<p style="margin:22px 0;"><a href="${esc(href)}" style="display:inline-block;background:${color};color:#fff;text-decoration:none;font-weight:700;padding:14px 26px;border-radius:12px;font-size:16px;">${esc(label)}</a></p>`;

function detailsTable(a: Appointment, withCustomer = false) {
  const row = (k: string, v: string) =>
    `<tr><td style="padding:7px 0;color:${BRAND.muted};font-size:13px;width:110px;vertical-align:top;">${k}</td><td style="padding:7px 0;font-weight:600;font-size:15px;">${v}</td></tr>`;
  const maps = a.address ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(a.address)}` : "";
  return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:${BRAND.bg};border-radius:12px;padding:10px 16px;margin:6px 0 4px;">
${row("Service", esc(a.services?.name ?? "Plumbing"))}
${row("Date", esc(formatDate(a.start_at)))}
${row("Time", `${formatTime(a.start_at)} – ${formatTime(a.end_at)}`)}
${a.address ? row("Address", `${esc(a.address)}${maps ? ` <a href="${esc(maps)}" style="color:${BRAND.sky};font-weight:500;font-size:13px;">map</a>` : ""}`) : ""}
${withCustomer ? row("Customer", esc(a.customer_name)) + row("Phone", `<a href="tel:${esc(a.customer_phone)}" style="color:${BRAND.navy};">${esc(a.customer_phone)}</a>`) + row("Email", esc(a.customer_email)) + row("Property", esc(a.property_type ?? "")) : ""}
${a.notes ? row("Message", `<span style="white-space:pre-wrap;font-weight:500;">${esc(a.notes)}</span>`) : ""}
</table>`;
}

const plainDetails = (a: Appointment) =>
  `${a.services?.name ?? "Plumbing"}\n${formatDate(a.start_at)}, ${formatTime(a.start_at)} – ${formatTime(a.end_at)}${a.address ? `\n${a.address}` : ""}`;

const firstName = (a: Appointment) => (a.customer_name ?? "").trim().split(/\s+/)[0] || "there";
const shortDate = (d: string) => formatDate(d, { weekday: "short", day: "numeric", month: "short", year: undefined });
const plumberInbox = () => process.env.PLUMBER_EMAIL ?? site.email;
const waNumber = (phone: string | null) => {
  const digits = (phone ?? "").replace(/\D/g, "");
  return digits.startsWith("0") ? `27${digits.slice(1)}` : digits;
};

const noteBox = (label: string, note: string) =>
  `<div style="border-left:4px solid ${BRAND.orange};background:#fff7f1;border-radius:8px;padding:12px 16px;margin:14px 0;">
<div style="font-size:12px;letter-spacing:1px;text-transform:uppercase;color:${BRAND.muted};margin-bottom:4px;">${esc(label)}</div>
<div style="font-size:15px;line-height:1.6;white-space:pre-wrap;">${esc(note)}</div></div>`;

export function appointmentIcs(a: Appointment, forPlumber: boolean) {
  const name = a.services?.name ?? "Plumbing";
  return buildIcs([
    {
      uid: a.id,
      start: new Date(a.start_at),
      end: new Date(a.end_at),
      summary: forPlumber ? `${name}: ${a.customer_name}` : `PlumAid: ${name}`,
      location: a.address ?? undefined,
      description: forPlumber
        ? `Customer: ${a.customer_name}\nPhone: ${a.customer_phone}\nEmail: ${a.customer_email}\n${a.notes ? `Notes: ${a.notes}` : ""}`
        : `PlumAid Plumbing Solutions\nCall/WhatsApp ${site.phoneDisplay}`,
    },
  ]);
}

/* ─── 1. Request received (customer) ─────────────────────────── */
export async function sendRequestReceived(a: Appointment, cancelUrl: string) {
  const html = layout(
    "We've received your booking request",
    `Thanks ${esc(firstName(a))}, we've got your request`,
    `<p style="font-size:15px;line-height:1.6;margin:0 0 10px;">Your plumber has been notified and will <strong>accept or decline</strong> this time shortly. We'll email you as soon as he answers. The time is reserved for you in the meantime.</p>
${detailsTable(a)}
<p style="font-size:14px;line-height:1.6;margin:16px 0 4px;">Urgent? Call or WhatsApp <strong>${site.phoneDisplay}</strong>.</p>
<p style="font-size:13px;color:${BRAND.muted};margin:14px 0 16px;">Changed your mind? <a href="${esc(cancelUrl)}" style="color:${BRAND.sky};">Cancel this request</a></p>`,
  );
  await send({
    to: a.customer_email!,
    subject: `Request received: ${shortDate(a.start_at)} at ${formatTime(a.start_at)}, PlumAid`,
    html,
    text: `Hi ${firstName(a)},\n\nWe've received your booking request. Your plumber will accept or decline it shortly and we'll email you the outcome.\n\n${plainDetails(a)}\n\nCancel: ${cancelUrl}\n\n${site.fullName} · ${site.phoneDisplay}`,
  });
}

/* ─── 2. New request (plumber) — with Accept / Decline buttons ─── */
export async function sendPlumberRequest(a: Appointment, acceptUrl: string, declineUrl: string, adminUrl: string) {
  const wa = waNumber(a.customer_phone);
  const html = layout(
    `${a.customer_name} would like to book ${formatDate(a.start_at, { weekday: "long", day: "numeric", month: "long", year: undefined })} at ${formatTime(a.start_at)}`,
    "New booking request",
    `<p style="font-size:15px;line-height:1.65;margin:0 0 10px;">Hi PlumAid team,</p>
<p style="font-size:15px;line-height:1.65;margin:0 0 10px;"><strong>${esc(a.customer_name)}</strong> would like to book
<strong>${esc(a.services?.name ?? "a plumber")}</strong> on <strong>${esc(formatDate(a.start_at))}</strong> at
<strong>${formatTime(a.start_at)}</strong>. Please accept or decline so we can let them know.</p>
${a.notes ? noteBox(`Message from ${firstName(a)}`, a.notes) : ""}
${detailsTable({ ...a, notes: null }, true)}
<table role="presentation" cellpadding="0" cellspacing="0" style="margin:22px 0 8px;"><tr>
<td style="padding-right:10px;"><a href="${esc(acceptUrl)}" style="display:inline-block;background:${BRAND.ok};color:#fff;text-decoration:none;font-weight:700;padding:14px 26px;border-radius:12px;font-size:16px;">Accept</a></td>
<td><a href="${esc(declineUrl)}" style="display:inline-block;background:#ffffff;color:${BRAND.bad};border:2px solid ${BRAND.bad};text-decoration:none;font-weight:700;padding:12px 24px;border-radius:12px;font-size:16px;">Decline</a></td>
</tr></table>
<p style="font-size:13px;color:${BRAND.muted};line-height:1.6;margin:8px 0 16px;">
You can add a short message for the customer on the next screen. Or contact them first:
<a href="tel:${esc(a.customer_phone)}" style="color:${BRAND.navy};">call</a>${wa ? ` · <a href="https://wa.me/${esc(wa)}" style="color:${BRAND.navy};">WhatsApp</a>` : ""} · just hit <strong>Reply</strong> to email them.
<br>All requests are also in your <a href="${esc(adminUrl)}" style="color:${BRAND.sky};">admin dashboard</a>.</p>`,
  );
  await send({
    to: plumberInbox(),
    replyTo: a.customer_email ?? undefined,
    subject: `Booking request: ${a.customer_name}, ${shortDate(a.start_at)} ${formatTime(a.start_at)}`,
    html,
    text: `New booking request\n\n${a.customer_name} would like to book ${a.services?.name ?? "a plumber"} on ${formatDate(a.start_at)} at ${formatTime(a.start_at)}.\n\n${plainDetails(a)}\nPhone: ${a.customer_phone}\nEmail: ${a.customer_email}\n${a.notes ? `\nMessage:\n${a.notes}\n` : ""}\nAccept: ${acceptUrl}\nDecline: ${declineUrl}\nDashboard: ${adminUrl}`,
  });
}

/* ─── 3. Accepted (customer) ─────────────────────────────────── */
export async function sendConfirmationEmail(a: Appointment, cancelUrl: string, note = "") {
  const html = layout(
    "Good news: your plumbing appointment is confirmed",
    "You're booked in",
    `<p style="font-size:15px;line-height:1.6;margin:0 0 10px;">Good news ${esc(firstName(a))}! Your plumber has <strong>accepted</strong> your request. A calendar file is attached so you can save it to your phone.</p>
${note ? noteBox("A note from your plumber", note) : ""}
${detailsTable(a)}
<p style="font-size:14px;line-height:1.6;margin:16px 0 4px;">Please make sure someone is home and the area around the problem is easy to reach. Running late or need to change something? Call or WhatsApp <strong>${site.phoneDisplay}</strong>.</p>
<p style="font-size:13px;color:${BRAND.muted};margin:14px 0 16px;">Need to cancel? <a href="${esc(cancelUrl)}" style="color:${BRAND.sky};">Cancel this appointment</a></p>`,
  );
  await send({
    to: a.customer_email!,
    subject: `Confirmed: ${shortDate(a.start_at)} at ${formatTime(a.start_at)}, PlumAid`,
    html,
    text: `Good news! Your PlumAid appointment is confirmed.\n\n${plainDetails(a)}\n${note ? `\nNote from your plumber: ${note}\n` : ""}\nCancel: ${cancelUrl}\n\n${site.phoneDisplay}`,
    ics: appointmentIcs(a, false),
  });
}

/* ─── 3b. Declined (customer) ────────────────────────────────── */
export async function sendDeclinedEmail(a: Appointment, bookUrl: string, note = "") {
  const html = layout(
    "About your booking request",
    "Sorry, that time doesn't work",
    `<p style="font-size:15px;line-height:1.6;margin:0 0 10px;">Hi ${esc(firstName(a))}, unfortunately your plumber can't make the time below. Sorry about that. Please pick another day, or give us a call and we'll find a time together.</p>
${note ? noteBox("A note from your plumber", note) : ""}
${detailsTable(a)}
${button(bookUrl, "Choose another day")}
<p style="font-size:14px;margin:0 0 16px;">Or call/WhatsApp <strong>${site.phoneDisplay}</strong>.</p>`,
  );
  await send({
    to: a.customer_email!,
    subject: "About your PlumAid booking request",
    html,
    text: `Hi ${firstName(a)},\n\nUnfortunately your plumber can't make this time:\n\n${plainDetails(a)}\n${note ? `\nNote: ${note}\n` : ""}\nPick another day: ${bookUrl}\nOr call ${site.phoneDisplay}`,
  });
}

/* ─── 4. Review request (customer) ───────────────────────────── */
export async function sendReviewRequest(a: Appointment, reviewUrl: string) {
  const stars = [1, 2, 3, 4, 5]
    .map((n) => `<a href="${esc(reviewUrl)}?r=${n}" style="text-decoration:none;font-size:34px;color:${BRAND.orange};padding:0 2px;">★</a>`)
    .join("");
  const html = layout(
    "How did we do? It takes 30 seconds",
    `Thanks, ${esc(a.customer_name?.split(" ")[0])}! How did we do?`,
    `<p style="font-size:15px;line-height:1.6;margin:0 0 6px;">Your plumbing job is marked as complete. We'd really appreciate a quick review. It helps other families and businesses in the area find a plumber they can trust.</p>
<p style="margin:14px 0 4px;">${stars}</p>
<p style="font-size:12px;color:${BRAND.muted};margin:0 0 6px;">Tap a star to rate us</p>
${button(reviewUrl, "Leave a review")}`,
  );
  await send({
    to: a.customer_email!,
    subject: "How did we do? Leave a PlumAid review",
    html,
    text: `Hi ${a.customer_name},\n\nThanks for choosing PlumAid. We'd love your feedback: ${reviewUrl}\n\n${site.fullName}`,
  });
}

/* ─── 5. Cancellations ───────────────────────────────────────── */
export async function sendCancelledToCustomer(a: Appointment, bookUrl: string) {
  const html = layout(
    "Your appointment was cancelled",
    "Your appointment has been cancelled",
    `<p style="font-size:15px;line-height:1.6;margin:0 0 10px;">Unfortunately we had to cancel the appointment below. We're sorry for the inconvenience.</p>
${detailsTable(a)}
${button(bookUrl, "Book another time")}
<p style="font-size:14px;margin:0 0 16px;">Or call/WhatsApp <strong>${site.phoneDisplay}</strong> and we'll sort it out.</p>`,
  );
  await send({
    to: a.customer_email!,
    subject: "Your PlumAid appointment was cancelled",
    html,
    text: `Your appointment was cancelled:\n\n${plainDetails(a)}\n\nRebook: ${bookUrl}\n${site.phoneDisplay}`,
  });
}

export async function sendCancelledToPlumber(a: Appointment) {
  const wasRequest = a.status === "pending";
  const html = layout(
    `Cancelled: ${a.customer_name}`,
    wasRequest ? "A customer withdrew their request" : "A customer cancelled",
    `<p style="font-size:15px;margin:0 0 10px;">${wasRequest ? "No need to answer it any more." : ""} The time is free again.</p>${detailsTable(a, true)}`,
  );
  await send({
    to: plumberInbox(),
    subject: `Cancelled: ${a.customer_name}, ${formatDate(a.start_at, { weekday: "short", day: "numeric", month: "short", year: undefined })}`,
    html,
    text: `Customer cancelled.\n\n${plainDetails(a)}\n${a.customer_name} ${a.customer_phone}`,
  });
}

/* ─── 6. Contact form (plumber) ──────────────────────────────── */
export async function sendContactMessage(m: { name: string; email: string; phone?: string; message: string }) {
  const html = layout(
    `Message from ${m.name}`,
    "New website message",
    `<table role="presentation" width="100%" style="background:${BRAND.bg};border-radius:12px;padding:12px 16px;font-size:15px;">
<tr><td style="color:${BRAND.muted};width:80px;padding:5px 0;">Name</td><td style="font-weight:600;">${esc(m.name)}</td></tr>
<tr><td style="color:${BRAND.muted};padding:5px 0;">Email</td><td>${esc(m.email)}</td></tr>
${m.phone ? `<tr><td style="color:${BRAND.muted};padding:5px 0;">Phone</td><td>${esc(m.phone)}</td></tr>` : ""}
</table><p style="font-size:15px;line-height:1.65;white-space:pre-wrap;margin:16px 0;">${esc(m.message)}</p>
<p style="font-size:13px;color:${BRAND.muted};">Just hit <strong>Reply</strong> to answer ${esc(m.name)} directly.</p>`,
  );
  await send({
    to: plumberInbox(),
    replyTo: m.email,
    subject: `Website message from ${m.name}`,
    html,
    text: `From: ${m.name} <${m.email}> ${m.phone ?? ""}\n\n${m.message}`,
  });
}
