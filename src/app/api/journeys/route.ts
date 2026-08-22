import { NextRequest, NextResponse } from "next/server";
import { query } from "@/lib/db";
import { JOURNEY_SELECT, type JourneyRow } from "@/lib/journeys";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  try {
    const sp = request.nextUrl.searchParams;
    const featured = sp.get("featured") === "1";
    const limitRaw = Number(sp.get("limit") ?? 8);
    const limit = Number.isFinite(limitRaw)
      ? Math.min(Math.max(limitRaw, 1), 40)
      : 8;

    const clauses: string[] = ["j.seats_available > 0"];
    if (featured) clauses.push("j.is_featured = TRUE");

    const { rows } = await query<JourneyRow>(
      `SELECT ${JOURNEY_SELECT}
       FROM journeys j
       JOIN cities fc ON fc.id = j.from_city_id
       JOIN cities tc ON tc.id = j.to_city_id
       JOIN operators o ON o.id = j.operator_id
       LEFT JOIN travel_categories cat ON cat.id = j.category_id
       WHERE ${clauses.join(" AND ")}
       ORDER BY j.is_featured DESC, j.departure_at ASC
       LIMIT $1`,
      [limit]
    );

    return NextResponse.json({ journeys: rows });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to load journeys";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
