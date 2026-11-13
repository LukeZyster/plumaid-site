import "server-only";
import { randomBytes } from "node:crypto";
import { NextResponse } from "next/server";
import { db, hasSupabase } from "./supabase/admin";
import type { Appointment, Service } from "./types";

export const newToken = () => randomBytes(24).toString("base64url");

export const siteUrl = () => (process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000").replace(/\/$/, "");

export const json = (data: unknown, status = 200) =>
  NextResponse.json(data, { status, headers: { "Cache-Control": "no-store" } });

const SELECT = "*, services(name, duration_minutes)";

export async function getAppointment(id: string): Promise<Appointment | null> {
  const { data } = await db().from("appointments").select(SELECT).eq("id", id).maybeSingle();
  return (data as Appointment) ?? null;
}

export async function getByVerifyToken(token: string): Promise<Appointment | null> {
  if (!token || token.length < 16) return null;
  const { data } = await db().from("appointments").select(SELECT).eq("verify_token", token).maybeSingle();
  return (data as Appointment) ?? null;
}

/** The secret link in the plumber's "new request" email (accept / decline). */
export async function getByDecisionToken(token: string): Promise<Appointment | null> {
  if (!token || token.length < 16) return null;
  const { data } = await db().from("appointments").select(SELECT).eq("decision_token", token).maybeSingle();
  return (data as Appointment) ?? null;
}

export async function getByReviewToken(token: string): Promise<Appointment | null> {
  if (!token || token.length < 16) return null;
  const { data } = await db().from("appointments").select(SELECT).eq("review_token", token).maybeSingle();
  return (data as Appointment) ?? null;
}

/** Same as the seed data in supabase/migrations/001_init.sql. Used only before the database is connected (preview). */
const FALLBACK_SERVICES: Service[] = [
  { id: "preview-1", slug: "maintenance-repairs", name: "Plumbing Maintenance & Repairs", description: "Leaks, dripping taps, faulty valves and general repairs.", duration_minutes: 60, sort_order: 1, active: true },
  { id: "preview-2", slug: "geysers-water-systems", name: "Geysers & Water Systems", description: "Geyser-related plumbing and water supply problems.", duration_minutes: 90, sort_order: 2, active: true },
  { id: "preview-3", slug: "pipe-repairs-replacements", name: "Pipe Repairs & Replacements", description: "Copper piping, fittings and general installations.", duration_minutes: 120, sort_order: 3, active: true },
  { id: "preview-4", slug: "general-assessment", name: "Not sure? General Assessment", description: "Describe the problem and we will come and take a look.", duration_minutes: 60, sort_order: 4, active: true },
];

export async function getServiceBySlug(slug: string): Promise<Service | null> {
  if (!hasSupabase()) return FALLBACK_SERVICES.find((s) => s.slug === slug) ?? null;
  const { data } = await db().from("services").select("*").eq("slug", slug).eq("active", true).maybeSingle();
  return (data as Service) ?? null;
}

export async function listServices(): Promise<Service[]> {
  if (!hasSupabase()) return FALLBACK_SERVICES;
  const { data } = await db().from("services").select("*").eq("active", true).order("sort_order");
  return (data as Service[]) ?? [];
}
