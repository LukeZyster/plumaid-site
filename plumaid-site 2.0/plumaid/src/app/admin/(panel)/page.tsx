import Link from "next/link";
import AppointmentActions from "@/components/admin/AppointmentActions";
import BlockForm from "@/components/admin/BlockForm";
import CopyField from "@/components/admin/CopyField";
import { siteUrl } from "@/lib/booking";
import { db } from "@/lib/supabase/admin";
import { addDays, formatDate, formatTime, toSastDateString, weekdayOf } from "@/lib/time";
import type { Appointment } from "@/lib/types";

const STATUS_LABEL: Record<string, string> = {
  held: "Awaiting email verification",
  confirmed: "Confirmed",
  completed: "Done",
  blocked: "Blocked",
};

function monthLabel(month: string) {
  return formatDate(`${month}-15T12:00:00+02:00`, { weekday: undefined, day: undefined, month: "long", year: "numeric" });
}

function shiftMonth(month: string, by: number) {
  const [y, m] = month.split("-").map(Number);
  const d = new Date(Date.UTC(y, m - 1 + by, 1));
  return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, "0")}`;
}

export default async function AdminCalendar({ searchParams }: { searchParams: Promise<{ m?: string; d?: string }> }) {
  const sp = await searchParams;
  const today = toSastDateString(new Date());
  const month = /^\d{4}-\d{2}$/.test(sp.m ?? "") ? sp.m! : (/^\d{4}-\d{2}-\d{2}$/.test(sp.d ?? "") ? sp.d!.slice(0, 7) : today.slice(0, 7));
  const selected = /^\d{4}-\d{2}-\d{2}$/.test(sp.d ?? "") ? sp.d! : month === today.slice(0, 7) ? today : `${month}-01`;

  const first = `${month}-01`;
  const next = `${shiftMonth(month, 1)}-01`;
  const rangeStart = new Date(`${first}T00:00:00+02:00`).toISOString();
  const rangeEnd = new Date(`${next}T00:00:00+02:00`).toISOString();
  const nowIso = new Date().toISOString();

  const supabase = db();
  const [monthRes, upcomingRes, heldRes] = await Promise.all([
    supabase
      .from("appointments")
      .select("*, services(name, duration_minutes)")
      .in("status", ["held", "confirmed", "completed", "blocked"])
      .gte("start_at", rangeStart)
      .lt("start_at", rangeEnd)
      .order("start_at"),
    supabase.from("appointments").select("id", { count: "exact", head: true }).eq("status", "confirmed").gte("start_at", nowIso),
    supabase.from("appointments").select("id", { count: "exact", head: true }).eq("status", "held").gt("hold_expires_at", nowIso),
  ]);

  const appts = ((monthRes.data as Appointment[]) ?? []).filter(
    (a) => a.status !== "held" || !a.hold_expires_at || a.hold_expires_at > nowIso,
  );
  const byDay = new Map<string, Appointment[]>();
  for (const a of appts) {
    const key = toSastDateString(new Date(a.start_at));
    byDay.set(key, [...(byDay.get(key) ?? []), a]);
  }

  // Month grid (Monday first)
  const lead = (weekdayOf(first) + 6) % 7;
  const cells: (string | null)[] = Array(lead).fill(null);
  for (let d = first; d < next; d = addDays(d, 1)) cells.push(d);
  while (cells.length % 7) cells.push(null);

  const todayCount = (byDay.get(today) ?? []).filter((a) => a.status === "confirmed").length;
  const doneThisMonth = appts.filter((a) => a.status === "completed").length;
  const dayList = byDay.get(selected) ?? [];

  const secret = process.env.CALENDAR_FEED_SECRET;
  const feedUrl = secret ? `${siteUrl()}/api/calendar/${secret}.ics` : null;
  const googleSync = Boolean(process.env.GOOGLE_SERVICE_ACCOUNT_JSON);

  return (
    <>
      <h1 className="adm-title">Appointments</h1>

      <ul className="adm-stats">
        <li><strong>{todayCount}</strong><span>jobs today</span></li>
        <li><strong>{upcomingRes.count ?? 0}</strong><span>upcoming confirmed</span></li>
        <li><strong>{heldRes.count ?? 0}</strong><span>awaiting email check</span></li>
        <li><strong>{doneThisMonth}</strong><span>done this month</span></li>
      </ul>

      <div className="adm-grid">
        <section aria-label="Calendar">
          <div className="adm-month-head">
            <Link className="btn btn--ghost-dark btn--small" href={`/admin?m=${shiftMonth(month, -1)}`} aria-label="Previous month">←</Link>
            <h2>{monthLabel(month)}</h2>
            <Link className="btn btn--ghost-dark btn--small" href={`/admin?m=${shiftMonth(month, 1)}`} aria-label="Next month">→</Link>
          </div>

          <div className="cal" role="grid" aria-label={monthLabel(month)}>
            {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((d) => (
              <div key={d} className="cal-dow" role="columnheader">{d}</div>
            ))}
            {cells.map((date, i) => {
              if (!date) return <div key={`e${i}`} className="cal-cell cal-cell--empty" role="gridcell" />;
              const list = byDay.get(date) ?? [];
              const cls = ["cal-cell", date === today && "is-today", date === selected && "is-selected"].filter(Boolean).join(" ");
              return (
                <Link key={date} href={`/admin?m=${month}&d=${date}`} className={cls} role="gridcell" aria-label={`${formatDate(`${date}T12:00:00+02:00`)}, ${list.length} items`}>
                  <span className="cal-num">{Number(date.slice(8))}</span>
                  <span className="cal-pills">
                    {list.slice(0, 3).map((a) => (
                      <span key={a.id} className={`pill pill--${a.status}`}>
                        {formatTime(a.start_at)} <em>{a.status === "blocked" ? "Blocked" : (a.customer_name ?? "").split(" ")[0]}</em>
                      </span>
                    ))}
                    {list.length > 3 && <span className="cal-more">+{list.length - 3} more</span>}
                  </span>
                  <span className="cal-dots" aria-hidden="true">
                    {list.slice(0, 4).map((a) => <i key={a.id} className={`dot dot--${a.status}`} />)}
                  </span>
                </Link>
              );
            })}
          </div>

          <ul className="cal-legend" aria-label="Legend">
            <li><i className="dot dot--confirmed" /> Confirmed</li>
            <li><i className="dot dot--held" /> Awaiting verification</li>
            <li><i className="dot dot--completed" /> Done</li>
            <li><i className="dot dot--blocked" /> Blocked</li>
          </ul>

          <h2 className="adm-h">{formatDate(`${selected}T12:00:00+02:00`)}</h2>
          {dayList.length === 0 ? (
            <p className="empty">Nothing booked for this day.</p>
          ) : (
            <ul className="adm-list">
              {dayList.map((a) => (
                <li key={a.id} className={`adm-appt adm-appt--${a.status}`}>
                  <div className="adm-appt-time">
                    <strong>{formatTime(a.start_at)}</strong>
                    <span>to {formatTime(a.end_at)}</span>
                  </div>
                  <div className="adm-appt-body">
                    <div className="adm-appt-top">
                      <h3>{a.status === "blocked" ? "Blocked time" : (a.services?.name ?? "Plumbing job")}</h3>
                      <span className={`chip chip--${a.status}`}>{STATUS_LABEL[a.status]}</span>
                    </div>
                    {a.status === "blocked" ? (
                      <p>{a.notes}</p>
                    ) : (
                      <>
                        <p><strong>{a.customer_name}</strong> · {a.property_type === "commercial" ? "Commercial" : "Residential"}</p>
                        <p>
                          <a href={`tel:${a.customer_phone}`}>{a.customer_phone}</a> ·{" "}
                          <a href={`mailto:${a.customer_email}`}>{a.customer_email}</a>
                        </p>
                        <p>
                          <a href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(a.address ?? "")}`} target="_blank" rel="noopener">
                            📍 {a.address}
                          </a>
                        </p>
                        {a.notes && <p className="adm-notes">“{a.notes}”</p>}
                        {a.status === "completed" && (
                          <p className="hint">{a.review_requested_at ? "Review email sent ✓" : "Review email not sent yet"}</p>
                        )}
                      </>
                    )}
                    <AppointmentActions id={a.id} status={a.status} />
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>

        <aside className="adm-side">
          <div className="card">
            <h2 className="adm-h">Block out time</h2>
            <p className="hint">Customers can&apos;t book blocked time.</p>
            <BlockForm date={selected} />
          </div>

          <div className="card">
            <h2 className="adm-h">Put it on your phone calendar</h2>
            {feedUrl ? (
              <>
                <p className="hint">
                  Add this link to Google Calendar → Other calendars → <em>From URL</em> (or iPhone → Add Subscribed Calendar). New bookings appear automatically.
                </p>
                <CopyField value={feedUrl} label="Calendar feed link" />
                <p className="hint">Keep this link private. Anyone with it can see your jobs.</p>
              </>
            ) : (
              <p className="alert alert--info">Set <code>CALENDAR_FEED_SECRET</code> in your environment to switch on the calendar link.</p>
            )}
            <p className="hint">Direct Google Calendar sync: <strong>{googleSync ? "on" : "off"}</strong></p>
          </div>
        </aside>
      </div>
    </>
  );
}
