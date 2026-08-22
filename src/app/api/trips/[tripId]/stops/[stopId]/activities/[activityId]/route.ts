import { NextRequest, NextResponse } from "next/server";
import { query } from "@/lib/db";
import { requireUser } from "@/lib/auth/require-user";
import { getOwnedTrip } from "@/lib/trips/queries";

export const runtime = "nodejs";

type Ctx = {
  params: Promise<{ tripId: string; stopId: string; activityId: string }>;
};

export async function DELETE(_req: NextRequest, ctx: Ctx) {
  const auth = await requireUser();
  if (auth.error) return auth.error;
  const { tripId, stopId, activityId } = await ctx.params;

  const trip = await getOwnedTrip(tripId, auth.user.id);
  if (!trip) {
    return NextResponse.json({ error: "Trip not found" }, { status: 404 });
  }

  const stopRes = await query(
    `SELECT id FROM trip_stops WHERE id = $1 AND trip_id = $2`,
    [stopId, tripId]
  );
  if (!stopRes.rows[0]) {
    return NextResponse.json({ error: "Stop not found" }, { status: 404 });
  }

  const deleted = await query(
    `DELETE FROM trip_activities
     WHERE id = $1 AND stop_id = $2
     RETURNING id`,
    [activityId, stopId]
  );
  if (!deleted.rows[0]) {
    return NextResponse.json({ error: "Activity not found" }, { status: 404 });
  }

  return NextResponse.json({ ok: true });
}
