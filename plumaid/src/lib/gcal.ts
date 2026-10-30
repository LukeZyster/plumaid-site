import "server-only";
import { JWT } from "google-auth-library";
import { TZ } from "./config";

/**
 * Optional: push confirmed appointments straight into the plumber's Google Calendar.
 * Does nothing (and never throws) unless GOOGLE_SERVICE_ACCOUNT_JSON + GOOGLE_CALENDAR_ID are set.
 */
function client(): { jwt: JWT; calendarId: string } | null {
  const raw = process.env.GOOGLE_SERVICE_ACCOUNT_JSON;
  const calendarId = process.env.GOOGLE_CALENDAR_ID;
  if (!raw || !calendarId) return null;
  try {
    const creds = JSON.parse(raw);
    const jwt = new JWT({
      email: creds.client_email,
      key: creds.private_key,
      scopes: ["https://www.googleapis.com/auth/calendar.events"],
    });
    return { jwt, calendarId };
  } catch (e) {
    console.error("[gcal] invalid GOOGLE_SERVICE_ACCOUNT_JSON", e);
    return null;
  }
}

const base = (id: string) => `https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(id)}/events`;

export async function createCalendarEvent(e: {
  summary: string;
  description: string;
  location: string;
  start: Date;
  end: Date;
}): Promise<string | null> {
  const c = client();
  if (!c) return null;
  try {
    const res = await c.jwt.request<{ id: string }>({
      url: base(c.calendarId),
      method: "POST",
      data: {
        summary: e.summary,
        description: e.description,
        location: e.location,
        start: { dateTime: e.start.toISOString(), timeZone: TZ },
        end: { dateTime: e.end.toISOString(), timeZone: TZ },
        reminders: {
          useDefault: false,
          overrides: [
            { method: "popup", minutes: 60 },
            { method: "popup", minutes: 24 * 60 },
          ],
        },
      },
    });
    return res.data.id;
  } catch (err) {
    console.error("[gcal] create failed", err);
    return null;
  }
}

export async function deleteCalendarEvent(eventId: string | null | undefined): Promise<void> {
  const c = client();
  if (!c || !eventId) return;
  try {
    await c.jwt.request({ url: `${base(c.calendarId)}/${encodeURIComponent(eventId)}`, method: "DELETE" });
  } catch (err) {
    console.error("[gcal] delete failed", err);
  }
}
