import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { query } from "@/lib/db";
import { requireUser } from "@/lib/auth/require-user";
import { getOwnedTrip } from "@/lib/trips/queries";
import { toDateString } from "@/lib/dates";

export const runtime = "nodejs";

type Ctx = { params: Promise<{ tripId: string; activityId: string }> };

const timeField = z
  .string()
  .regex(/^\d{2}:\d{2}$/, "Use HH:MM")
  .nullable()
  .optional();

const patchSchema = z
  .object({
    is_done: z.boolean().optional(),
    custom_cost: z.number().nonnegative().nullable().optional(),
    notes: z.string().max(2000).nullable().optional(),
    start_time: timeField,
    end_time: timeField,
    day_date: z
      .string()
      .regex(/^\d{4}-\d{2}-\d{2}$/)
      .optional(),
  })
  .refine(
    (d) =>
      d.start_time == null ||
      d.end_time == null ||
      d.start_time === null ||
      d.end_time === null ||
      d.end_time >= d.start_time,
    { message: "End time must be after start time", path: ["end_time"] }
  );

export async function PATCH(request: NextRequest, ctx: Ctx) {
  const auth = await requireUser();
  if (auth.error) return auth.error;
  const { tripId, activityId } = await ctx.params;

  const trip = await getOwnedTrip(tripId, auth.user.id);
  if (!trip) {
    return NextResponse.json({ error: "Trip not found" }, { status: 404 });
  }

  const owned = await query<{
    id: string;
    stop_start: string;
    stop_end: string;
  }>(
    `SELECT
       ta.id,
       to_char(s.start_date, 'YYYY-MM-DD') AS stop_start,
       to_char(s.end_date, 'YYYY-MM-DD') AS stop_end
     FROM trip_activities ta
     JOIN trip_stops s ON s.id = ta.stop_id
     WHERE ta.id = $1 AND s.trip_id = $2`,
    [activityId, tripId]
  );
  if (!owned.rows[0]) {
    return NextResponse.json({ error: "Activity not found" }, { status: 404 });
  }

  const parsed = patchSchema.safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid input" },
      { status: 400 }
    );
  }

  const d = parsed.data;
  if (
    d.is_done === undefined &&
    d.custom_cost === undefined &&
    d.notes === undefined &&
    d.start_time === undefined &&
    d.end_time === undefined &&
    d.day_date === undefined
  ) {
    return NextResponse.json({ error: "No changes provided" }, { status: 400 });
  }

  if (d.day_date) {
    const stop = owned.rows[0];
    if (d.day_date < stop.stop_start || d.day_date > stop.stop_end) {
      return NextResponse.json(
        { error: "Day must fall within this stop's dates" },
        { status: 400 }
      );
    }
  }

  const { rows } = await query(
    `UPDATE trip_activities SET
       is_done = COALESCE($1, is_done),
       custom_cost = CASE WHEN $2::boolean THEN $3 ELSE custom_cost END,
       notes = CASE WHEN $4::boolean THEN $5 ELSE notes END,
       start_time = CASE WHEN $6::boolean THEN $7 ELSE start_time END,
       end_time = CASE WHEN $8::boolean THEN $9 ELSE end_time END,
       day_date = COALESCE($10::date, day_date)
     WHERE id = $11
     RETURNING
       id, stop_id, activity_id,
       to_char(day_date, 'YYYY-MM-DD') AS day_date,
       start_time, end_time, act_order, notes, custom_cost, is_done`,
    [
      d.is_done ?? null,
      d.custom_cost !== undefined,
      d.custom_cost ?? null,
      d.notes !== undefined,
      d.notes ?? null,
      d.start_time !== undefined,
      d.start_time ?? null,
      d.end_time !== undefined,
      d.end_time ?? null,
      d.day_date ?? null,
      activityId,
    ]
  );

  const row = rows[0];
  return NextResponse.json({
    trip_activity: row
      ? { ...row, day_date: toDateString(row.day_date) }
      : row,
  });
}
