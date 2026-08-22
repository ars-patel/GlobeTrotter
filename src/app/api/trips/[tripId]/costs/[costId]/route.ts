import { NextResponse } from "next/server";
import { query } from "@/lib/db";
import { requireUser } from "@/lib/auth/require-user";
import { getOwnedTrip } from "@/lib/trips/queries";

export const runtime = "nodejs";

type Ctx = { params: Promise<{ tripId: string; costId: string }> };

export async function DELETE(_req: Request, ctx: Ctx) {
  const auth = await requireUser();
  if (auth.error) return auth.error;
  const { tripId, costId } = await ctx.params;
  const trip = await getOwnedTrip(tripId, auth.user.id);
  if (!trip) {
    return NextResponse.json({ error: "Trip not found" }, { status: 404 });
  }

  const deleted = await query(
    `DELETE FROM trip_costs WHERE id = $1 AND trip_id = $2 RETURNING id`,
    [costId, tripId]
  );
  if (!deleted.rows[0]) {
    return NextResponse.json({ error: "Cost line not found" }, { status: 404 });
  }
  return NextResponse.json({ ok: true });
}
