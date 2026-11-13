-- ═══════════════════════════════════════════════════════════════
--  PlumAid: booking REQUESTS that the plumber approves or declines
--  + optional address, + more places for admin photos/videos.
--
--  Run AFTER 001_init.sql (Supabase → SQL Editor → New query → Run).
--  Safe to run more than once.
-- ═══════════════════════════════════════════════════════════════

-- ─── New appointment statuses ───────────────────────────────────
--   pending  → customer sent a request; waiting for the plumber to accept/decline
--              (the time is reserved so nobody else can request it)
--   declined → plumber said no; the time is free again
alter table public.appointments drop constraint if exists appointments_status_check;
alter table public.appointments add constraint appointments_status_check
  check (status in ('held','pending','confirmed','completed','cancelled','expired','declined','blocked'));

-- ─── Address is now optional ────────────────────────────────────
alter table public.appointments drop constraint if exists appt_customer_required;
alter table public.appointments add constraint appt_customer_required check (
  status = 'blocked'
  or (customer_name is not null and customer_email is not null and customer_phone is not null)
);

-- ─── Columns for the approval step ──────────────────────────────
alter table public.appointments add column if not exists decision_token text unique;  -- secret in the plumber's email
alter table public.appointments add column if not exists decided_at     timestamptz;
alter table public.appointments add column if not exists decision_note  text;         -- optional message to the customer
alter table public.appointments add column if not exists declined_at    timestamptz;

-- ─── No-double-booking guarantee now also covers pending requests ─
alter table public.appointments drop constraint if exists appt_no_overlap;
alter table public.appointments add constraint appt_no_overlap
  exclude using gist (tstzrange(start_at, block_end) with &&)
  where (status in ('held','pending','confirmed','completed','blocked'));

-- ─── Requests whose time has passed without an answer are released ─
create or replace function public.expire_stale_holds()
returns void
language sql
security definer
set search_path = public
as $$
  update public.appointments
     set status = 'expired'
   where (status = 'held' and hold_expires_at < now())
      or (status = 'pending' and start_at < now());
$$;

-- ─── Create a pending request (atomic; refuses overlaps) ────────
create or replace function public.create_request(
  p_service_id     uuid,
  p_start          timestamptz,
  p_end            timestamptz,
  p_block_end      timestamptz,
  p_name           text,
  p_email          text,
  p_phone          text,
  p_address        text,
  p_property_type  text,
  p_notes          text,
  p_customer_token text,
  p_decision_token text
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

  -- abuse protection: max 3 open requests per email per day
  select count(*) into v_recent
    from public.appointments
   where lower(customer_email) = lower(p_email)
     and status = 'pending'
     and created_at > now() - interval '1 day';
  if v_recent >= 3 then
    return jsonb_build_object('ok', false, 'error', 'rate_limited');
  end if;

  begin
    insert into public.appointments (
      service_id, status, start_at, end_at, block_end,
      customer_name, customer_email, customer_phone, address, property_type, notes,
      verify_token, decision_token
    ) values (
      p_service_id, 'pending', p_start, p_end, p_block_end,
      p_name, p_email, p_phone, nullif(p_address, ''), p_property_type, p_notes,
      p_customer_token, p_decision_token
    ) returning id into v_id;
  exception when exclusion_violation then
    return jsonb_build_object('ok', false, 'error', 'slot_taken');
  end;

  return jsonb_build_object('ok', true, 'id', v_id);
end;
$$;

revoke all on function public.create_request(uuid,timestamptz,timestamptz,timestamptz,text,text,text,text,text,text,text,text) from public, anon, authenticated;
grant execute on function public.create_request(uuid,timestamptz,timestamptz,timestamptz,text,text,text,text,text,text,text,text) to service_role;
revoke all on function public.expire_stale_holds() from public, anon, authenticated;
grant execute on function public.expire_stale_holds() to service_role;

-- ─── More places the admin can put photos / videos ──────────────
--   hero    → big picture/video at the top of the home page
--   job     → completed-job slideshow (videos AND photos now)
--   team    → photos of the plumbers
--   business→ van / workshop / premises
alter table public.media_items drop constraint if exists media_items_category_check;
alter table public.media_items add constraint media_items_category_check
  check (category in ('hero','job','team','business'));

-- Allow larger photos from phones (still 50 MB max on the free plan)
update storage.buckets
   set allowed_mime_types = array['image/jpeg','image/png','image/webp','video/mp4','video/webm','video/quicktime']
 where id = 'media';
