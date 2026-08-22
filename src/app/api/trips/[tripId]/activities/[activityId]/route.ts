import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { query } from "@/lib/db";
import { requireUser } from "@/lib/auth/require-user";
import { getOwnedTrip } from "@/lib/trips/queries";

export const runtime = "nodejs";

type Ctx = { params: Promise<{ tripId: string; activityId: string }> };

const patchSchema = z.object({
  is_done: z.boolean().optional(),
  custom_cost: z.number().nonnegative().nullable().optional(),
  notes: z.string().max(2000).nullable().optional(),
});

export async function PATCH(request: NextRequest, ctx: Ctx) {
  const auth = await requireUser();
  if (auth.error) return auth.error;
  const { tripId, activityId } = await ctx.params;

  const trip = await getOwnedTrip(tripId, auth.user.id);
  if (!trip) {
    return NextResponse.json({ error: "Trip not found" }, { status: 404 });
  }

  const owned = await query(
    `SELECT ta.id
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
    d.notes === undefined
  ) {
    return NextResponse.json({ error: "No changes provided" }, { status: 400 });
  }

  const { rows } = await query(
    `UPDATE trip_activities SET
       is_done = COALESCE($1, is_done),
       custom_cost = CASE WHEN $2::boolean THEN $3 ELSE custom_cost END,
       notes = CASE WHEN $4::boolean THEN $5 ELSE notes END
     WHERE id = $6
     RETURNING *`,
    [
      d.is_done ?? null,
      d.custom_cost !== undefined,
      d.custom_cost ?? null,
      d.notes !== undefined,
      d.notes ?? null,
      activityId,
    ]
  );

  return NextResponse.json({ trip_activity: rows[0] });
}
