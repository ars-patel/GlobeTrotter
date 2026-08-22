import { NextRequest, NextResponse } from "next/server";
import { query } from "@/lib/db";

export const runtime = "nodejs";

/** Public destinations catalog (cities enriched for booking homepage). */
export async function GET(request: NextRequest) {
  try {
    const sp = request.nextUrl.searchParams;
    const q = sp.get("q")?.trim() ?? "";
    const limitRaw = Number(sp.get("limit") ?? 12);
    const limit = Number.isFinite(limitRaw)
      ? Math.min(Math.max(limitRaw, 1), 50)
      : 12;
    const popular = sp.get("popular") === "1";

    const params: unknown[] = [];
    const clauses: string[] = [];

    if (q) {
      params.push(`%${q}%`);
      clauses.push(
        `(name ILIKE $${params.length} OR country ILIKE $${params.length})`
      );
    }

    const where = clauses.length ? `WHERE ${clauses.join(" AND ")}` : "";
    const order = popular
      ? "popularity DESC, name ASC"
      : "popularity DESC, name ASC";

    params.push(limit);
    const { rows } = await query(
      `SELECT
         id, name, country, region, description,
         starting_price::float8 AS starting_price,
         popularity, image_url, cost_index::float8 AS cost_index
       FROM cities
       ${where}
       ORDER BY ${order}
       LIMIT $${params.length}`,
      params
    );

    return NextResponse.json({ destinations: rows });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to load destinations";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
