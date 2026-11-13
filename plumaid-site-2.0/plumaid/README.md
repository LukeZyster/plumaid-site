# PlumAid Plumbing Solutions: website and booking system

Next.js (App Router) + Supabase + Vercel. Customers pick a day on the calendar and send a booking request. The plumber accepts or declines it by email (or in the dashboard), the customer is told the outcome, the job lands on his calendar, and a review email goes out when he marks the job done.

## What's in it

| Page | URL |
|---|---|
| Home (hero, services, job-video slideshow, team/business gallery, how it works, reviews) | `/` |
| Book an appointment | `/appointments` |
| Reviews | `/reviews` |
| Company history | `/history` |
| Mission statement | `/mission` |
| Contact | `/contact` |
| Plumber dashboard (calendar, mark done, block time, upload videos/photos, hide reviews) | `/admin` |

### How the booking flow works
1. Customer opens the calendar (home page or `/appointments`). Days are coloured: **green** = open, **orange** = some times booked, **red** = fully booked, grey = closed.
2. They tap a day → a pop-up asks for first name, surname, email, cell, address (optional), property type, a preferred time and a message.
3. The time is reserved as a **request** and the plumber (`PLUMBER_EMAIL`, plumaidwlt@gmail.com) gets a nicely laid-out email with **Accept** / **Decline** buttons. The customer gets a "we received your request" email.
4. The plumber taps Accept or Decline (from the email, or from `/admin`), optionally adds a note, and the customer is emailed the outcome. Accepted jobs get a calendar invite and a cancel link.
5. When the job is done the plumber presses **Mark job done** in `/admin` and the customer is emailed a review link.

### Admin (`/admin`)
- **Requests to answer** at the top (accept / decline with an optional message).
- **Calendar** of every request, booking and blocked time. Click a day to see details.
- **Mark as booked**: block a whole day, a few hours, or a range of days (leave). Customers see those days as booked.
- **Photos & videos**: upload/hide/rename/delete the home-page hero picture or video, completed-job slideshow (videos or photos), team photos and business photos.
- **Reviews**: hide any review.

### No double bookings
Enforced **inside Postgres** with an exclusion constraint (`appt_no_overlap`), not just in the UI. Two people clicking at the same instant cannot both win. Every job also reserves a 30-minute travel buffer. If a time is taken, the customer is told and picks another. Unverified holds that lapse release the slot automatically. Tested against a real Postgres 16.

## Setup (about 20 minutes)

### 1. Supabase
1. Create a project at supabase.com.
2. **SQL Editor → New query**, paste `supabase/migrations/001_init.sql`, **Run**. Then do the same with `supabase/migrations/002_booking_requests.sql`. (Creates tables, booking functions, security rules, the `media` storage bucket and the 4 services, then adds the request/approval step.)
3. **Authentication → Users → Add user**: the plumber's email + a strong password (tick *Auto confirm*).
4. **Project Settings → API**: copy the Project URL, `anon` key and `service_role` key.

### 2. Email (Gmail, free)
Turn on 2-step verification on the Gmail account, then create an **App password** (Google Account → Security → App passwords). That 16-character code is `SMTP_PASS`. Gmail allows roughly 500 emails a day, plenty for this business.

### 3. Environment variables
Copy `.env.example` to `.env.local` and fill it in. Add the **same variables in Vercel** (Project → Settings → Environment Variables). Set `NEXT_PUBLIC_SITE_URL` to the live address, and `ADMIN_EMAILS` to the plumber's login email.

### 4. Run locally
```bash
npm install
npm run dev      # http://localhost:3000
```

### 5. GitHub → Vercel
```bash
git init && git add . && git commit -m "PlumAid website"
git branch -M main
git remote add origin https://github.com/<you>/plumaid.git
git push -u origin main
```
In Vercel: **Add New → Project → import the repo → Deploy**. Add the env variables first, then redeploy.

### 6. Put jobs on the plumber's phone calendar
Open `/admin`. The sidebar shows a private calendar link. In Google Calendar choose **Other calendars → From URL** and paste it. Optional: set `GOOGLE_SERVICE_ACCOUNT_JSON` for instant direct sync (see `.env.example`).

## Things to edit
- **Working hours, buffer, notice, hold time:** `src/lib/config.ts`
- **Business details, services, nav, homepage copy:** `src/content/site.ts`
- **Company history and mission text:** `src/content/story.ts`. Replace with the real story and founding details.
- **Services and durations:** the `services` table in Supabase.
- **Logo and mascot:** redrawn as vector in `src/components/Brand.tsx`. To use the original artwork, put the files in `public/brand/` and swap them in.

## Security notes
- Customer data is never readable from the browser. Row Level Security is on and only the server uses the service key.
- Never commit `.env.local` (it is git-ignored). Keep `SUPABASE_SERVICE_ROLE_KEY` and `SMTP_PASS` secret.
- Video uploads go straight to Supabase Storage (max 50 MB each on the free plan).
