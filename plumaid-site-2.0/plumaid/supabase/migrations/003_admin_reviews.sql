-- PlumAid: let the plumber add reviews himself (from WhatsApp, Facebook, Google, in person...)
-- with an optional screenshot. Run in Supabase SQL Editor. Safe to run more than once.

alter table public.reviews alter column appointment_id drop not null;
alter table public.reviews add column if not exists source text not null default 'website';
alter table public.reviews add column if not exists anonymous boolean not null default false;
alter table public.reviews add column if not exists screenshot_url text;
alter table public.reviews add column if not exists storage_path text;
alter table public.reviews add column if not exists review_date date;

alter table public.reviews drop constraint if exists reviews_source_check;
alter table public.reviews add constraint reviews_source_check
  check (source in ('website','whatsapp','facebook','google','sms','email','in_person','other'));
