# PlumAid Plumbing Solutions: website and booking system

Next.js (App Router) + Supabase + Vercel. Customers book online, verify by email and get a confirmation. The plumber is notified, the job lands on his calendar, and a review email goes out when he marks the job done.

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
1. Customer picks a service and a time. Taken times are greyed out.
2. The slot is **held for 60 minutes** and a verification email is sent.
3. Customer clicks the link and presses **Confirm**. The booking is now confirmed:
   customer gets a confirmation email (with calendar invite and cancel link), the plumber gets a notification email (with invite), and it appears on the admin calendar, the subscribable `.ics` feed, and optionally Google Calendar directly.
4. Plumber opens `/admin` and presses **Mark job done**. The customer is emailed a review link.
5. The review appears on `/reviews` (the plumber can hide any).

### No double bookings
Enforced **inside Postgres** with an exclusion constraint (`appt_no_overlap`), not just in the UI. Two people clicking at the same instant cannot both win. Every job also reserves a 30-minute travel buffer. If a time is taken, the customer is told and picks another. Unverified holds that lapse release the slot automatically. Tested against a real Postgres 16.

## Setup (about 20 minutes)

### 1. Supabase
1. Create a project at supabase.com.
2. **SQL Editor → New query**, paste `supabase/migrations/001_init.sql`, **Run**. (Creates tables, booking functions, security rules, the `media` storage bucket and the 4 services.)
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
