import { NextResponse } from "next/server";
import { query } from "@/lib/db";
import { requireAdmin } from "@/lib/auth/require-admin";

export const runtime = "nodejs";

export async function GET() {
  const auth = await requireAdmin();
  if (auth.error) return auth.error;

  const { rows } = await query(
    `SELECT
       u.id,
       u.email,
       u.username,
       u.first_name,
       u.last_name,
       u.name,
       u.role::text AS role,
       u.created_at::text AS created_at,
       (SELECT COUNT(*)::int FROM trips t WHERE t.user_id = u.id) AS trip_count
     FROM users u
     ORDER BY u.created_at DESC
     LIMIT 100`
  );

  return NextResponse.json({
    users: rows.map((r) => ({
      id: String(r.id),
      email: String(r.email),
      username: r.username == null ? null : String(r.username),
      first_name: String(r.first_name),
      last_name: String(r.last_name),
      name: String(r.name),
      role: r.role === "ADMIN" ? "ADMIN" : "USER",
      created_at: String(r.created_at).slice(0, 10),
      trip_count: Number(r.trip_count),
    })),
  });
}
