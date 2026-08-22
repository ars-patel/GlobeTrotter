import { NextResponse } from "next/server";
import { query } from "@/lib/db";
import { requireUser } from "@/lib/auth/require-user";
import { createTripSchema } from "@/lib/trips/schemas";

export const runtime = "nodejs";

export async function GET() {
  const auth = await requireUser();
  if (auth.error) return auth.error;

  try {
    const { rows } = await query(
      `SELECT
         t.id, t.name, t.description, t.cover_photo,
         t.start_date, t.end_date, t.start_point, t.end_point,
         t.is_public, t.share_slug, t.budget_limit, t.created_at,
         (SELECT COUNT(*)::int FROM trip_stops s WHERE s.trip_id = t.id) AS destination_count
       FROM trips t
       WHERE t.user_id = $1
       ORDER BY t.start_date ASC, t.created_at DESC`,
      [auth.user.id]
    );

    const today = new Date().toISOString().slice(0, 10);
    const ongoing = [];
    const upcoming = [];
    const completed = [];

    for (const trip of rows) {
      const start = String(trip.start_date).slice(0, 10);
      const end = String(trip.end_date).slice(0, 10);
      if (start <= today && today <= end) ongoing.push(trip);
      else if (start > today) upcoming.push(trip);
      else completed.push(trip);
    }

    return NextResponse.json({ ongoing, upcoming, completed, trips: rows });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to load trips";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const auth = await requireUser();
  if (auth.error) return auth.error;

  try {
    const body = await request.json();
    const parsed = createTripSchema.safeParse({
      ...body,
      budget_limit:
        body.budget_limit === "" || body.budget_limit == null
          ? null
          : Number(body.budget_limit),
    });
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message ?? "Invalid input" },
        { status: 400 }
      );
    }

    const data = parsed.data;
    const { rows } = await query(
      `INSERT INTO trips (
         user_id, name, description, cover_photo,
         start_date, end_date, start_point, end_point, budget_limit
       ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)
       RETURNING *`,
      [
        auth.user.id,
        data.name,
        data.description ?? null,
        data.cover_photo ?? null,
        data.start_date,
        data.end_date,
        data.start_point,
        data.end_point,
        data.budget_limit ?? null,
      ]
    );

    const trip = rows[0];
    const packing = data.packing_items ?? [];
    for (let i = 0; i < packing.length; i++) {
      const item = packing[i];
      await query(
        `INSERT INTO trip_packing_items (trip_id, label, checked, source, sort_order)
         VALUES ($1, $2, $3, 'weather_suggestion', $4)`,
        [trip.id, item.label, item.checked ?? false, i]
      );
    }

    return NextResponse.json({ trip }, { status: 201 });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to create trip";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
