import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { query } from "@/lib/db";
import { requireUser } from "@/lib/auth/require-user";
import { getOwnedTrip } from "@/lib/trips/queries";

export const runtime = "nodejs";

type Ctx = { params: Promise<{ tripId: string; stopId: string }> };

const activitySchema = z
  .object({
    activity_id: z.string().uuid(),
    day_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
    start_time: z.string().max(8).optional(),
    end_time: z.string().max(8).optional(),
    notes: z.string().max(2000).optional(),
    custom_cost: z.number().nonnegative().optional().nullable(),
  })
  .refine(
    (d) => !d.start_time || !d.end_time || d.end_time >= d.start_time,
    { message: "End time must be after start time", path: ["end_time"] }
  );

export async function POST(request: NextRequest, ctx: Ctx) {
  const auth = await requireUser();
  if (auth.error) return auth.error;
  const { tripId, stopId } = await ctx.params;

  const trip = await getOwnedTrip(tripId, auth.user.id);
  if (!trip) return NextResponse.json({ error: "Trip not found" }, { status: 404 });

  const stopRes = await query(
    `SELECT * FROM trip_stops WHERE id = $1 AND trip_id = $2`,
    [stopId, tripId]
  );
  const stop = stopRes.rows[0];
  if (!stop) return NextResponse.json({ error: "Stop not found" }, { status: 404 });

  const parsed = activitySchema.safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid input" },
      { status: 400 }
    );
  }

  const day = parsed.data.day_date;
  const stopStart = String(stop.start_date).slice(0, 10);
  const stopEnd = String(stop.end_date).slice(0, 10);
  if (day < stopStart || day > stopEnd) {
    return NextResponse.json(
      { error: "Activity day must fall within the stop dates" },
      { status: 400 }
    );
  }

  const act = await query(
    `SELECT id, city_id FROM activities WHERE id = $1`,
    [parsed.data.activity_id]
  );
  if (!act.rows[0]) {
    return NextResponse.json({ error: "Activity not found" }, { status: 400 });
  }
  if (act.rows[0].city_id !== stop.city_id) {
    return NextResponse.json(
      { error: "Activity must belong to the stop city" },
      { status: 400 }
    );
  }

  const orderRes = await query<{ next: number }>(
    `SELECT COALESCE(MAX(act_order), -1) + 1 AS next
     FROM trip_activities WHERE stop_id = $1 AND day_date = $2`,
    [stopId, day]
  );

  const { rows } = await query(
    `INSERT INTO trip_activities (
       stop_id, activity_id, day_date, start_time, end_time, act_order, notes, custom_cost
     ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8)
     RETURNING *`,
    [
      stopId,
      parsed.data.activity_id,
      day,
      parsed.data.start_time ?? null,
      parsed.data.end_time ?? null,
      orderRes.rows[0].next,
      parsed.data.notes ?? null,
      parsed.data.custom_cost ?? null,
    ]
  );

  return NextResponse.json({ trip_activity: rows[0] }, { status: 201 });
}
