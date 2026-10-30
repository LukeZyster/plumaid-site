-- ═══════════════════════════════════════════════════════════════
--  PlumAid Plumbing Solutions: database schema
--  Run this once in Supabase → SQL Editor → New query → Run
-- ═══════════════════════════════════════════════════════════════

-- ─── Services ───────────────────────────────────────────────────
create table if not exists public.services (
  id               uuid primary key default gen_random_uuid(),
  slug             text unique not null,
  name             text not null,
  description      text not null default '',
  duration_minutes integer not null check (duration_minutes between 15 and 480),
  sort_order       integer not null default 0,
  active           boolean not null default true
);

-- ─── Appointments ───────────────────────────────────────────────
-- status lifecycle:
--   held      → customer submitted, waiting for them to verify by email (slot is reserved)
--   confirmed → customer verified; plumber notified; on the calendar
--   completed → plumber marked the job done (triggers the review email)
--   cancelled / expired → slot released
--   blocked   → plumber time-off / unavailable
create table if not exists public.appointments (
  id                   uuid primary key default gen_random_uuid(),
  service_id           uuid references public.services(id),
  status               text not null check (status in ('held','confirmed','completed','cancelled','expired','blocked')),

  start_at             timestamptz not null,
  end_at               timestamptz not null,
  -- end_at + travel buffer. This is the range that is protected from overlap.
  block_end            timestamptz not null,

  customer_name        text,
  customer_email       text,
  customer_phone       text,
  address              text,
  property_type        text check (property_type in ('residential','commercial')),
  notes                text,

  verify_token         text unique,
  review_token         text unique,
  hold_expires_at      timestamptz,

  verified_at          timestamptz,
  completed_at         timestamptz,
  cancelled_at         timestamptz,
  review_requested_at  timestamptz,
  google_event_id      text,

  created_at           timestamptz not null default now(),

  constraint appt_time_order check (end_at > start_at and block_end >= end_at),
  constraint appt_customer_required check (
    status = 'blocked'
    or (customer_name is not null and customer_email is not null and customer_phone is not null and address is not null)
  ),

  -- ★ THE DOUBLE-BOOKING GUARANTEE ★
  -- Postgres itself refuses any two live appointments whose time ranges overlap.
  -- Even two people clicking "Book" at the same millisecond cannot both succeed.
  constraint appt_no_overlap exclude using gist (tstzrange(start_at, block_end) with &&)
    where (status in ('held','confirmed','completed','blocked'))
);

create index if not exists appt_start_idx  on public.appointments (start_at);
create index if not exists appt_status_idx on public.appointments (status);
create index if not exists appt_email_idx  on public.appointments (lower(customer_email));

-- ─── Reviews ────────────────────────────────────────────────────
create table if not exists public.reviews (
  id             uuid primary key default gen_random_uuid(),
  appointment_id uuid unique not null references public.appointments(id) on delete cascade,
  reviewer_name  text not null,
  rating         integer not null check (rating between 1 and 5),
  comment        text not null default '',
  published      boolean not null default true,
  created_at     timestamptz not null default now()
);

-- ─── Contact messages ───────────────────────────────────────────
create table if not exists public.contact_messages (
  id         uuid primary key default gen_random_uuid(),
  name       text not null,
  email      text not null,
  phone      text,
  message    text not null,
  created_at timestamptz not null default now()
);

-- ─── Media (job videos + team/business photos) ──────────────────
create table if not exists public.media_items (
  id           uuid primary key default gen_random_uuid(),
  kind         text not null check (kind in ('video','photo')),
  category     text not null check (category in ('job','team','business')),
  title        text not null default '',
  caption      text not null default '',
  storage_path text not null,
  public_url   text not null,
  sort_order   integer not null default 0,
  published    boolean not null default true,
  created_at   timestamptz not null default now()
);

-- ═══════════════════════════════════════════════════════════════
--  Functions: atomic booking logic
--  (only the server, using the service-role key, may call these)
-- ═══════════════════════════════════════════════════════════════

-- Release any unverified holds that ran out of time.
create or replace function public.expire_stale_holds()
returns void
language sql
security definer
set search_path = public
as $$
  update public.appointments
     set status = 'expired'
   where status = 'held' and hold_expires_at < now();
$$;

-- Create a held appointment. Returns {ok:true,id} or {ok:false,error:'slot_taken'|'rate_limited'}
create or replace function public.create_appointment(
  p_service_id    uuid,
  p_start         timestamptz,
  p_end           timestamptz,
  p_block_end     timestamptz,
  p_name          text,
  p_email         text,
  p_phone         text,
  p_address       text,
  p_property_type text,
  p_notes         text,
  p_verify_token  text,
  p_hold_minutes  integer default 60
) returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_id uuid;
  v_recent integer;
begin
  perform public.expire_stale_holds();

  -- basic abuse protection: max 3 unverified holds per email per hour
  select count(*) into v_recent
    from public.appointments
   where lower(customer_email) = lower(p_email)
     and status = 'held'
     and created_at > now() - interval '1 hour';
  if v_recent >= 3 then
    return jsonb_build_object('ok', false, 'error', 'rate_limited');
  end if;

  begin
    insert into public.appointments (
      service_id, status, start_at, end_at, block_end,
      customer_name, customer_email, customer_phone, address, property_type, notes,
      verify_token, hold_expires_at
    ) values (
      p_service_id, 'held', p_start, p_end, p_block_end,
      p_name, p_email, p_phone, p_address, p_property_type, p_notes,
      p_verify_token, now() + make_interval(mins => p_hold_minutes)
    ) returning id into v_id;
  exception when exclusion_violation then
    return jsonb_build_object('ok', false, 'error', 'slot_taken');
  end;

  return jsonb_build_object('ok', true, 'id', v_id);
end;
$$;

-- Customer clicked the email link. held/expired → confirmed (if the slot is still theirs).
create or replace function public.verify_appointment(p_token text)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  a public.appointments%rowtype;
begin
  select * into a from public.appointments where verify_token = p_token for update;
  if not found then
    return jsonb_build_object('ok', false, 'error', 'invalid');
  end if;

  if a.status in ('confirmed','completed') then
    return jsonb_build_object('ok', true, 'id', a.id, 'already', true);
  end if;
  if a.status = 'cancelled' then
    return jsonb_build_object('ok', false, 'error', 'cancelled');
  end if;
  if a.start_at < now() then
    return jsonb_build_object('ok', false, 'error', 'past');
  end if;

  begin
    update public.appointments
       set status = 'confirmed', verified_at = now(), hold_expires_at = null
     where id = a.id;
  exception when exclusion_violation then
    -- hold had expired and someone else took the slot in the meantime
    return jsonb_build_object('ok', false, 'error', 'slot_taken');
  end;

  return jsonb_build_object('ok', true, 'id', a.id, 'already', false);
end;
$$;

-- Plumber blocks out time (leave, lunch, a big job elsewhere…)
create or replace function public.create_block(
  p_start timestamptz, p_end timestamptz, p_note text
) returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare v_id uuid;
begin
  perform public.expire_stale_holds();
  begin
    insert into public.appointments (status, start_at, end_at, block_end, notes)
    values ('blocked', p_start, p_end, p_end, p_note)
    returning id into v_id;
  exception when exclusion_violation then
    return jsonb_build_object('ok', false, 'error', 'overlaps_booking');
  end;
  return jsonb_build_object('ok', true, 'id', v_id);
end;
$$;

revoke all on function public.expire_stale_holds()                 from public, anon, authenticated;
revoke all on function public.create_appointment(uuid,timestamptz,timestamptz,timestamptz,text,text,text,text,text,text,text,integer) from public, anon, authenticated;
revoke all on function public.verify_appointment(text)             from public, anon, authenticated;
revoke all on function public.create_block(timestamptz,timestamptz,text) from public, anon, authenticated;
grant execute on function public.expire_stale_holds()              to service_role;
grant execute on function public.create_appointment(uuid,timestamptz,timestamptz,timestamptz,text,text,text,text,text,text,text,integer) to service_role;
grant execute on function public.verify_appointment(text)          to service_role;
grant execute on function public.create_block(timestamptz,timestamptz,text) to service_role;

-- ═══════════════════════════════════════════════════════════════
--  Row Level Security
--  Customer data (appointments, messages) is never readable from the browser.
--  Only published reviews / media are public.
-- ═══════════════════════════════════════════════════════════════
alter table public.services          enable row level security;
alter table public.appointments      enable row level security;
alter table public.reviews           enable row level security;
alter table public.contact_messages  enable row level security;
alter table public.media_items       enable row level security;

drop policy if exists "public read services" on public.services;
create policy "public read services" on public.services for select using (active);

drop policy if exists "public read published reviews" on public.reviews;
create policy "public read published reviews" on public.reviews for select using (published);

drop policy if exists "public read published media" on public.media_items;
create policy "public read published media" on public.media_items for select using (published);

-- ─── Storage bucket for videos and photos ───────────────────────
-- (50 MB per file is the Supabase free-plan ceiling)
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'media', 'media', true, 52428800,
  array['image/jpeg','image/png','image/webp','video/mp4','video/webm','video/quicktime']
)
on conflict (id) do update
  set public = true,
      file_size_limit = 52428800,
      allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "public read media files" on storage.objects;
create policy "public read media files" on storage.objects
  for select using (bucket_id = 'media');
-- Uploads are done through short-lived signed URLs issued by the admin API; no public write policy needed.

-- ═══════════════════════════════════════════════════════════════
--  Seed data: services from the PlumAid business card
-- ═══════════════════════════════════════════════════════════════
insert into public.services (slug, name, description, duration_minutes, sort_order) values
  ('maintenance-repairs', 'Plumbing Maintenance & Repairs', 'Leaks, dripping taps, faulty valves and general repairs.', 60, 1),
  ('geysers-water-systems', 'Geysers & Water Systems', 'Geyser-related plumbing and water supply problems.', 90, 2),
  ('pipe-repairs-replacements', 'Pipe Repairs & Replacements', 'Copper piping, fittings and general installations.', 120, 3),
  ('general-assessment', 'Not sure? General Assessment', 'Describe the problem and we will come and take a look.', 60, 4)
on conflict (slug) do nothing;
