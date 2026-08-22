import { NextRequest, NextResponse } from "next/server";
import { query } from "@/lib/db";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  try {
    const cityId = request.nextUrl.searchParams.get("cityId");
    const type = request.nextUrl.searchParams.get("type");

    const clauses: string[] = [];
    const params: unknown[] = [];

    if (cityId) {
      params.push(cityId);
      clauses.push(`city_id = $${params.length}`);
    }

    if (type) {
      params.push(type);
      clauses.push(`type = $${params.length}`);
    }

    const where = clauses.length ? `WHERE ${clauses.join(" AND ")}` : "";

    const { rows } = await query(
      `SELECT id, city_id, name, description, type, cost, duration_hrs, image_url
       FROM activities
       ${where}
       ORDER BY name ASC
       LIMIT 100`,
      params
    );

    return NextResponse.json({ activities: rows });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to load activities";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
