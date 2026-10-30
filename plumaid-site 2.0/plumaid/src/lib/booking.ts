import "server-only";
import { randomBytes } from "node:crypto";
import { NextResponse } from "next/server";
import { db } from "./supabase/admin";
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

export async function getByReviewToken(token: string): Promise<Appointment | null> {
  if (!token || token.length < 16) return null;
  const { data } = await db().from("appointments").select(SELECT).eq("review_token", token).maybeSingle();
  return (data as Appointment) ?? null;
}

export async function getServiceBySlug(slug: string): Promise<Service | null> {
  const { data } = await db().from("services").select("*").eq("slug", slug).eq("active", true).maybeSingle();
  return (data as Service) ?? null;
}

export async function listServices(): Promise<Service[]> {
  const { data } = await db().from("services").select("*").eq("active", true).order("sort_order");
  return (data as Service[]) ?? [];
}
