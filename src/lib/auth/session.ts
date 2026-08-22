import { cookies } from "next/headers";
import jwt from "jsonwebtoken";
import { NextResponse } from "next/server";
import { query } from "@/lib/db";

export const AUTH_COOKIE = "gt_session";
const COOKIE_MAX_AGE = 60 * 60 * 24 * 7; // 7 days

export type SessionPayload = {
  sub: string;
  email: string;
};

export type PublicUser = {
  id: string;
  email: string;
  username: string | null;
  first_name: string;
  last_name: string;
  name: string;
  phone: string | null;
  home_city: string | null;
  home_country: string | null;
  additional_info: string | null;
  photo_url: string | null;
  language: string;
  role: "USER" | "ADMIN";
  created_at: string;
};

function getJwtSecret() {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error("JWT_SECRET is not set");
  }
  return secret;
}

export function signSessionToken(payload: SessionPayload) {
  return jwt.sign(payload, getJwtSecret(), { expiresIn: "7d" });
}

export function verifySessionToken(token: string): SessionPayload | null {
  try {
    const decoded = jwt.verify(token, getJwtSecret()) as SessionPayload;
    if (!decoded?.sub || !decoded?.email) return null;
    return { sub: decoded.sub, email: decoded.email };
  } catch {
    return null;
  }
}

export function setAuthCookie(response: NextResponse, token: string) {
  response.cookies.set(AUTH_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: COOKIE_MAX_AGE,
  });
}

export function clearAuthCookie(response: NextResponse) {
  response.cookies.set(AUTH_COOKIE, "", {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 0,
  });
}

export async function getSessionTokenFromCookies() {
  const jar = await cookies();
  return jar.get(AUTH_COOKIE)?.value ?? null;
}

export async function getCurrentUser(): Promise<PublicUser | null> {
  const token = await getSessionTokenFromCookies();
  if (!token) return null;

  const session = verifySessionToken(token);
  if (!session) return null;

  const { rows } = await query(
    `SELECT
       id, email, username, first_name, last_name, name,
       phone, home_city, home_country, additional_info,
       photo_url, language, role, created_at::text,
       is_suspended
     FROM users
     WHERE id = $1`,
    [session.sub]
  );

  const row = rows[0] as
    | (Record<string, unknown> & { is_suspended: boolean })
    | undefined;
  if (!row || row.is_suspended) return null;

  return toPublicUser(row);
}

export function toPublicUser(row: Record<string, unknown>): PublicUser {
  return {
    id: String(row.id),
    email: String(row.email),
    username: row.username == null ? null : String(row.username),
    first_name: String(row.first_name),
    last_name: String(row.last_name),
    name: String(row.name),
    phone: row.phone == null ? null : String(row.phone),
    home_city: row.home_city == null ? null : String(row.home_city),
    home_country: row.home_country == null ? null : String(row.home_country),
    additional_info:
      row.additional_info == null ? null : String(row.additional_info),
    photo_url: row.photo_url == null ? null : String(row.photo_url),
    language: String(row.language ?? "en"),
    role: row.role === "ADMIN" ? "ADMIN" : "USER",
    created_at: String(row.created_at),
  };
}
