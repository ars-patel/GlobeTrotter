import { NextResponse } from "next/server";
import { query } from "@/lib/db";
import { requireUser } from "@/lib/auth/require-user";
import { updateProfileSchema } from "@/lib/auth/profile-schema";
import {
  clearAuthCookie,
  setAuthCookie,
  signSessionToken,
  toPublicUser,
} from "@/lib/auth/session";
import { toDateString } from "@/lib/dates";

export const runtime = "nodejs";

export async function GET() {
  const auth = await requireUser();
  if (auth.error) return auth.error;

  const today = new Date().toISOString().slice(0, 10);
  const trips = await query(
    `SELECT
       id, name, description, cover_photo,
       to_char(start_date, 'YYYY-MM-DD') AS start_date,
       to_char(end_date, 'YYYY-MM-DD') AS end_date,
       start_point, end_point
     FROM trips
     WHERE user_id = $1
     ORDER BY start_date ASC`,
    [auth.user.id]
  );

  const saved = await query(
    `SELECT
       sd.id,
       sd.city_id,
       c.name AS city_name,
       c.country,
       c.region,
       c.image_url
     FROM saved_destinations sd
     JOIN cities c ON c.id = sd.city_id
     WHERE sd.user_id = $1
     ORDER BY c.name ASC`,
    [auth.user.id]
  );

  const planned = trips.rows.filter(
    (t) => toDateString(t.end_date) >= today
  );
  const previous = trips.rows.filter(
    (t) => toDateString(t.end_date) < today
  );

  return NextResponse.json({
    user: auth.user,
    planned,
    previous,
    saved_destinations: saved.rows,
  });
}

export async function PATCH(request: Request) {
  const auth = await requireUser();
  if (auth.error) return auth.error;

  const body = await request.json();
  const parsed = updateProfileSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid input" },
      { status: 400 }
    );
  }

  const d = parsed.data;
  const email = d.email.toLowerCase();

  const emailClash = await query(
    `SELECT id FROM users WHERE LOWER(email) = $1 AND id <> $2`,
    [email, auth.user.id]
  );
  if (emailClash.rows[0]) {
    return NextResponse.json(
      { error: "That email is already in use" },
      { status: 409 }
    );
  }

  if (d.username) {
    const userClash = await query(
      `SELECT id FROM users WHERE LOWER(username) = LOWER($1) AND id <> $2`,
      [d.username, auth.user.id]
    );
    if (userClash.rows[0]) {
      return NextResponse.json(
        { error: "That username is already taken" },
        { status: 409 }
      );
    }
  }

  const displayName = `${d.first_name} ${d.last_name}`.trim();

  // Only allow relative upload paths or empty — block remote URL injection
  let photoUrl = d.photo_url;
  if (photoUrl && !photoUrl.startsWith("/uploads/")) {
    return NextResponse.json(
      { error: "Invalid photo URL" },
      { status: 400 }
    );
  }

  try {
    const { rows } = await query(
      `UPDATE users SET
         first_name = $1,
         last_name = $2,
         name = $3,
         email = $4,
         username = $5,
         phone = $6,
         home_city = $7,
         home_country = $8,
         additional_info = $9,
         photo_url = $10,
         language = $11,
         updated_at = NOW()
       WHERE id = $12
       RETURNING
         id, email, username, first_name, last_name, name,
         phone, home_city, home_country, additional_info,
         photo_url, language, role, created_at::text`,
      [
        d.first_name,
        d.last_name,
        displayName,
        email,
        d.username,
        d.phone,
        d.home_city,
        d.home_country,
        d.additional_info,
        photoUrl,
        d.language,
        auth.user.id,
      ]
    );

    const user = toPublicUser(rows[0] as Record<string, unknown>);
    const response = NextResponse.json({ user });
    if (user.email !== auth.user.email) {
      const token = signSessionToken({ sub: user.id, email: user.email });
      setAuthCookie(response, token);
    }
    return response;
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to update profile";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function DELETE() {
  const auth = await requireUser();
  if (auth.error) return auth.error;

  try {
    await query(`DELETE FROM users WHERE id = $1`, [auth.user.id]);
    const response = NextResponse.json({ ok: true });
    clearAuthCookie(response);
    return response;
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to delete account";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
