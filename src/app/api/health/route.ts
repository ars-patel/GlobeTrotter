import { NextResponse } from "next/server";
import { getPool } from "@/lib/db";

export const runtime = "nodejs";

const REQUIRED_TABLES = [
  "users",
  "cities",
  "activities",
  "trips",
  "trip_stops",
  "trip_activities",
  "trip_costs",
  "saved_destinations",
  "password_reset_tokens",
  "packing_suggestion_templates",
  "trip_packing_items",
  "community_posts",
  "app_settings",
] as const;

export async function GET() {
  try {
    const pool = getPool();
    const time = await pool.query<{ now: string }>("SELECT NOW() AS now");

    const tables = await pool.query<{ table_name: string }>(
      `SELECT table_name
       FROM information_schema.tables
       WHERE table_schema = 'public' AND table_type = 'BASE TABLE'`
    );
    const present = new Set(tables.rows.map((r) => r.table_name));
    const missingTables = REQUIRED_TABLES.filter((t) => !present.has(t));

    const counts = await pool.query<{ t: string; n: string }>(`
      SELECT 'cities' AS t, COUNT(*)::text AS n FROM cities
      UNION ALL SELECT 'activities', COUNT(*)::text FROM activities
      UNION ALL SELECT 'users', COUNT(*)::text FROM users
      UNION ALL SELECT 'packing_suggestion_templates', COUNT(*)::text FROM packing_suggestion_templates
      UNION ALL SELECT 'app_settings', COUNT(*)::text FROM app_settings
    `);

    const catalog: Record<string, number> = {};
    for (const row of counts.rows) {
      catalog[row.t] = Number(row.n);
    }

    const schemaOk = missingTables.length === 0;

    return NextResponse.json(
      {
        status: schemaOk ? "ok" : "degraded",
        service: "globetrotter",
        database: "connected",
        serverTime: time.rows[0]?.now,
        schema: {
          ok: schemaOk,
          missingTables,
          requiredTableCount: REQUIRED_TABLES.length,
        },
        catalog,
      },
      { status: schemaOk ? 200 : 503 }
    );
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Database connection failed";
    return NextResponse.json(
      {
        status: "error",
        service: "globetrotter",
        database: "disconnected",
        message,
      },
      { status: 503 }
    );
  }
}
