import { NextResponse } from "next/server";
import { getPool } from "@/lib/db";
import { requireUser } from "@/lib/auth/require-user";

export const runtime = "nodejs";

type Ctx = { params: Promise<{ slug: string }> };

export async function POST(_req: Request, ctx: Ctx) {
  const auth = await requireUser();
  if (auth.error) return auth.error;

  const { slug } = await ctx.params;
  const pool = getPool();
  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    const { rows: trips } = await client.query(
      `SELECT *
       FROM trips
       WHERE share_slug = $1 AND is_public = TRUE
       FOR SHARE`,
      [slug]
    );
    const source = trips[0];
    if (!source) {
      await client.query("ROLLBACK");
      return NextResponse.json({ error: "Shared trip not found" }, { status: 404 });
    }

    const { rows: created } = await client.query(
      `INSERT INTO trips (
         user_id, name, description, cover_photo,
         start_date, end_date, start_point, end_point, budget_limit,
         is_public, share_slug
       ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, FALSE, NULL)
       RETURNING *`,
      [
        auth.user.id,
        `${source.name} (copy)`,
        source.description,
        source.cover_photo,
        source.start_date,
        source.end_date,
        source.start_point,
        source.end_point,
        source.budget_limit,
      ]
    );
    const newTrip = created[0];

    const { rows: stops } = await client.query(
      `SELECT * FROM trip_stops WHERE trip_id = $1 ORDER BY stop_order ASC`,
      [source.id]
    );

    const stopIdMap = new Map<string, string>();

    for (const stop of stops) {
      const { rows: newStops } = await client.query(
        `INSERT INTO trip_stops (
           trip_id, city_id, start_date, end_date, stop_order, notes
         ) VALUES ($1, $2, $3, $4, $5, $6)
         RETURNING id`,
        [
          newTrip.id,
          stop.city_id,
          stop.start_date,
          stop.end_date,
          stop.stop_order,
          stop.notes,
        ]
      );
      stopIdMap.set(stop.id, newStops[0].id);
    }

    for (const stop of stops) {
      const newStopId = stopIdMap.get(stop.id);
      if (!newStopId) continue;
      const { rows: acts } = await client.query(
        `SELECT * FROM trip_activities WHERE stop_id = $1 ORDER BY act_order ASC`,
        [stop.id]
      );
      for (const act of acts) {
        await client.query(
          `INSERT INTO trip_activities (
             stop_id, activity_id, day_date, start_time, end_time,
             act_order, notes, custom_cost, is_done
           ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,FALSE)`,
          [
            newStopId,
            act.activity_id,
            act.day_date,
            act.start_time,
            act.end_time ?? null,
            act.act_order,
            act.notes,
            act.custom_cost,
          ]
        );
      }
    }

    const { rows: costs } = await client.query(
      `SELECT * FROM trip_costs WHERE trip_id = $1`,
      [source.id]
    );
    for (const cost of costs) {
      await client.query(
        `INSERT INTO trip_costs (trip_id, category, label, amount, day_date)
         VALUES ($1, $2, $3, $4, $5)`,
        [newTrip.id, cost.category, cost.label, cost.amount, cost.day_date]
      );
    }

    const { rows: packing } = await client.query(
      `SELECT * FROM trip_packing_items WHERE trip_id = $1 ORDER BY sort_order ASC`,
      [source.id]
    );
    for (const item of packing) {
      await client.query(
        `INSERT INTO trip_packing_items (trip_id, label, checked, source, sort_order)
         VALUES ($1, $2, FALSE, $3, $4)`,
        [newTrip.id, item.label, item.source, item.sort_order]
      );
    }

    await client.query("COMMIT");
    return NextResponse.json({ trip: newTrip }, { status: 201 });
  } catch (error) {
    await client.query("ROLLBACK");
    const message =
      error instanceof Error ? error.message : "Failed to copy trip";
    return NextResponse.json({ error: message }, { status: 500 });
  } finally {
    client.release();
  }
}
