import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getPool, query } from "@/lib/db";
import { requireUser } from "@/lib/auth/require-user";
import { getOwnedTrip } from "@/lib/trips/queries";

export const runtime = "nodejs";

type Ctx = { params: Promise<{ tripId: string }> };

const reorderSchema = z.object({
  stop_ids: z.array(z.string().uuid()).min(1),
});

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

  const existing = await query<{ id: string }>(
    `SELECT id FROM trip_stops WHERE trip_id = $1`,
    [tripId]
  );
  const existingIds = new Set(existing.rows.map((r) => r.id));
  const ordered = parsed.data.stop_ids;

  if (
    ordered.length !== existingIds.size ||
    ordered.some((id) => !existingIds.has(id))
  ) {
    return NextResponse.json(
      { error: "stop_ids must include every stop on this trip exactly once" },
      { status: 400 }
    );
  }

  const client = await getPool().connect();
  try {
    await client.query("BEGIN");
    await client.query(
      `UPDATE trip_stops SET stop_order = -stop_order - 1000 WHERE trip_id = $1`,
      [tripId]
    );
    for (let i = 0; i < ordered.length; i++) {
      await client.query(
        `UPDATE trip_stops SET stop_order = $1 WHERE id = $2 AND trip_id = $3`,
        [i + 1, ordered[i], tripId]
      );
    }
    await client.query("COMMIT");
  } catch (error) {
    await client.query("ROLLBACK");
    const message =
      error instanceof Error ? error.message : "Failed to reorder stops";
    return NextResponse.json({ error: message }, { status: 500 });
  } finally {
    client.release();
  }

  const { rows } = await query(
    `SELECT
       s.id, s.trip_id, s.city_id,
       to_char(s.start_date, 'YYYY-MM-DD') AS start_date,
       to_char(s.end_date, 'YYYY-MM-DD') AS end_date,
       s.stop_order, s.notes,
       c.name AS city_name, c.country
     FROM trip_stops s
     JOIN cities c ON c.id = s.city_id
     WHERE s.trip_id = $1
     ORDER BY s.stop_order ASC`,
    [tripId]
  );

  return NextResponse.json({ stops: rows });
}
