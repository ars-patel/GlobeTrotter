import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { query } from "@/lib/db";
import { requireUser } from "@/lib/auth/require-user";
import { getOwnedTrip } from "@/lib/trips/queries";
import { toDateString } from "@/lib/dates";

export const runtime = "nodejs";

type Ctx = { params: Promise<{ tripId: string; stopId: string }> };

const patchSchema = z
  .object({
    city_id: z.string().uuid().optional(),
    start_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
    end_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
    notes: z.string().max(2000).optional().nullable(),
  })
  .refine(
    (d) =>
      !d.start_date ||
      !d.end_date ||
      d.end_date >= d.start_date,
    {
      message: "Stop end date must be on or after start date",
      path: ["end_date"],
    }
  );

async function getOwnedStop(tripId: string, stopId: string, userId: string) {
  const trip = await getOwnedTrip(tripId, userId);
  if (!trip) return { trip: null, stop: null };
  const { rows } = await query(
    `SELECT * FROM trip_stops WHERE id = $1 AND trip_id = $2`,
    [stopId, tripId]
  );
  return { trip, stop: rows[0] ?? null };
}

export async function PATCH(request: NextRequest, ctx: Ctx) {
  const auth = await requireUser();
  if (auth.error) return auth.error;
  const { tripId, stopId } = await ctx.params;
  const { trip, stop } = await getOwnedStop(tripId, stopId, auth.user.id);
  if (!trip) {
    return NextResponse.json({ error: "Trip not found" }, { status: 404 });
  }
  if (!stop) {
    return NextResponse.json({ error: "Stop not found" }, { status: 404 });
  }

  const parsed = patchSchema.safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid input" },
      { status: 400 }
    );
  }

  const start = parsed.data.start_date ?? toDateString(stop.start_date);
  const end = parsed.data.end_date ?? toDateString(stop.end_date);
  if (end < start) {
    return NextResponse.json(
      { error: "Stop end date must be on or after start date" },
      { status: 400 }
    );
  }

  const tripStart = toDateString(trip.start_date);
  const tripEnd = toDateString(trip.end_date);
  if (start < tripStart || end > tripEnd) {
    return NextResponse.json(
      { error: "Stop dates must fall within the trip date range" },
      { status: 400 }
    );
  }

  if (parsed.data.city_id) {
    const city = await query(`SELECT id FROM cities WHERE id = $1`, [
      parsed.data.city_id,
    ]);
    if (!city.rows[0]) {
      return NextResponse.json({ error: "City not found" }, { status: 400 });
    }
  }

  const { rows } = await query(
    `UPDATE trip_stops SET
       city_id = COALESCE($1, city_id),
       start_date = $2,
       end_date = $3,
       notes = COALESCE($4, notes)
     WHERE id = $5 AND trip_id = $6
     RETURNING *`,
    [
      parsed.data.city_id ?? null,
      start,
      end,
      parsed.data.notes === undefined ? null : parsed.data.notes,
      stopId,
      tripId,
    ]
  );

  return NextResponse.json({ stop: rows[0] });
}

export async function DELETE(_req: NextRequest, ctx: Ctx) {
  const auth = await requireUser();
  if (auth.error) return auth.error;
  const { tripId, stopId } = await ctx.params;
  const { trip, stop } = await getOwnedStop(tripId, stopId, auth.user.id);
  if (!trip) {
    return NextResponse.json({ error: "Trip not found" }, { status: 404 });
  }
  if (!stop) {
    return NextResponse.json({ error: "Stop not found" }, { status: 404 });
  }

  await query(`DELETE FROM trip_stops WHERE id = $1 AND trip_id = $2`, [
    stopId,
    tripId,
  ]);

  const remaining = await query<{ id: string }>(
    `SELECT id FROM trip_stops WHERE trip_id = $1 ORDER BY stop_order ASC`,
    [tripId]
  );
  if (remaining.rows.length > 0) {
    await query(
      `UPDATE trip_stops SET stop_order = -stop_order - 1000 WHERE trip_id = $1`,
      [tripId]
    );
    for (let i = 0; i < remaining.rows.length; i++) {
      await query(`UPDATE trip_stops SET stop_order = $1 WHERE id = $2`, [
        i + 1,
        remaining.rows[i].id,
      ]);
    }
  }

  return NextResponse.json({ ok: true });
}
