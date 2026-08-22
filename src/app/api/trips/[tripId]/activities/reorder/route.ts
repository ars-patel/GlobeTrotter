import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getPool, query } from "@/lib/db";
import { requireUser } from "@/lib/auth/require-user";
import { getOwnedTrip } from "@/lib/trips/queries";
import { toDateString } from "@/lib/dates";

export const runtime = "nodejs";

type Ctx = { params: Promise<{ tripId: string }> };

const reorderSchema = z.object({
  day_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  activity_ids: z.array(z.string().uuid()).min(1),
});

/** Reorder trip_activities within a single day (PS calendar/timeline). */
export async function PATCH(request: NextRequest, ctx: Ctx) {
  const auth = await requireUser();
  if (auth.error) return auth.error;
  const { tripId } = await ctx.params;
  const trip = await getOwnedTrip(tripId, auth.user.id);
  if (!trip) {
    return NextResponse.json({ error: "Trip not found" }, { status: 404 });
  }

  const parsed = reorderSchema.safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid input" },
      { status: 400 }
    );
  }

  const { day_date, activity_ids } = parsed.data;

  const existing = await query<{ id: string }>(
    `SELECT ta.id
     FROM trip_activities ta
     JOIN trip_stops s ON s.id = ta.stop_id
     WHERE s.trip_id = $1 AND ta.day_date = $2::date`,
    [tripId, day_date]
  );
  const existingIds = new Set(existing.rows.map((r) => r.id));

  if (
    activity_ids.length !== existingIds.size ||
    activity_ids.some((id) => !existingIds.has(id))
  ) {
    return NextResponse.json(
      {
        error:
          "activity_ids must include every activity on that day exactly once",
      },
      { status: 400 }
    );
  }

  const client = await getPool().connect();
  try {
    await client.query("BEGIN");
    // Avoid unique conflicts if any composite constraints appear later
    for (let i = 0; i < activity_ids.length; i++) {
      await client.query(
        `UPDATE trip_activities SET act_order = $1 WHERE id = $2`,
        [-(i + 1), activity_ids[i]]
      );
    }
    for (let i = 0; i < activity_ids.length; i++) {
      await client.query(
        `UPDATE trip_activities SET act_order = $1 WHERE id = $2`,
        [i, activity_ids[i]]
      );
    }
    await client.query("COMMIT");
  } catch (error) {
    await client.query("ROLLBACK");
    const message =
      error instanceof Error ? error.message : "Failed to reorder activities";
    return NextResponse.json({ error: message }, { status: 500 });
  } finally {
    client.release();
  }

  const { rows } = await query(
    `SELECT
       ta.id, ta.stop_id, ta.activity_id,
       to_char(ta.day_date, 'YYYY-MM-DD') AS day_date,
       ta.start_time, ta.end_time,
       ta.act_order, ta.notes, ta.custom_cost, ta.is_done,
       a.name AS activity_name, a.type, a.cost
     FROM trip_activities ta
     JOIN activities a ON a.id = ta.activity_id
     JOIN trip_stops s ON s.id = ta.stop_id
     WHERE s.trip_id = $1 AND ta.day_date = $2::date
     ORDER BY ta.act_order ASC, ta.start_time ASC NULLS LAST`,
    [tripId, day_date]
  );

  return NextResponse.json({
    day_date,
    activities: rows.map((r) => ({
      ...r,
      day_date: toDateString(r.day_date),
    })),
  });
}
