import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { query } from "@/lib/db";
import { requireUser } from "@/lib/auth/require-user";
import { getOwnedTrip } from "@/lib/trips/queries";
import { toDateString } from "@/lib/dates";

export const runtime = "nodejs";

type Ctx = { params: Promise<{ tripId: string }> };

const stopSchema = z
  .object({
    city_id: z.string().uuid(),
    start_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
    end_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
    notes: z.string().max(2000).optional(),
  })
  .refine((d) => d.end_date >= d.start_date, {
    message: "Stop end date must be on or after start date",
    path: ["end_date"],
  });

export async function GET(_req: NextRequest, ctx: Ctx) {
  const auth = await requireUser();
  if (auth.error) return auth.error;
  const { tripId } = await ctx.params;
  const trip = await getOwnedTrip(tripId, auth.user.id);
  if (!trip) return NextResponse.json({ error: "Trip not found" }, { status: 404 });

  const { rows } = await query(
    `SELECT s.*, c.name AS city_name, c.country
     FROM trip_stops s
     JOIN cities c ON c.id = s.city_id
     WHERE s.trip_id = $1
     ORDER BY s.stop_order ASC`,
    [tripId]
  );
  return NextResponse.json({ stops: rows });
}

export async function POST(request: NextRequest, ctx: Ctx) {
  const auth = await requireUser();
  if (auth.error) return auth.error;
  const { tripId } = await ctx.params;
  const trip = await getOwnedTrip(tripId, auth.user.id);
  if (!trip) return NextResponse.json({ error: "Trip not found" }, { status: 404 });

  const parsed = stopSchema.safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid input" },
      { status: 400 }
    );
  }

  const tripStart = toDateString(trip.start_date);
  const tripEnd = toDateString(trip.end_date);
  if (parsed.data.start_date < tripStart || parsed.data.end_date > tripEnd) {
    return NextResponse.json(
      { error: "Stop dates must fall within the trip date range" },
      { status: 400 }
    );
  }

  const city = await query(`SELECT id FROM cities WHERE id = $1`, [
    parsed.data.city_id,
  ]);
  if (!city.rows[0]) {
    return NextResponse.json({ error: "City not found" }, { status: 400 });
  }

  const orderRes = await query<{ next: number }>(
    `SELECT COALESCE(MAX(stop_order), 0) + 1 AS next FROM trip_stops WHERE trip_id = $1`,
    [tripId]
  );

  const { rows } = await query(
    `INSERT INTO trip_stops (trip_id, city_id, start_date, end_date, stop_order, notes)
     VALUES ($1,$2,$3,$4,$5,$6)
     RETURNING *`,
    [
      tripId,
      parsed.data.city_id,
      parsed.data.start_date,
      parsed.data.end_date,
      orderRes.rows[0].next,
      parsed.data.notes ?? null,
    ]
  );

  return NextResponse.json({ stop: rows[0] }, { status: 201 });
}
