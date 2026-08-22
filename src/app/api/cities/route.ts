import { NextRequest, NextResponse } from "next/server";
import { query } from "@/lib/db";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  try {
    const q = request.nextUrl.searchParams.get("q")?.trim() ?? "";
    const country = request.nextUrl.searchParams.get("country")?.trim();

    const clauses: string[] = [];
    const params: unknown[] = [];

    if (q) {
      params.push(`%${q}%`);
      clauses.push(`(name ILIKE $${params.length} OR country ILIKE $${params.length})`);
    }

    if (country) {
      params.push(country);
      clauses.push(`country ILIKE $${params.length}`);
    }

    const where = clauses.length ? `WHERE ${clauses.join(" AND ")}` : "";

    const { rows } = await query(
      `SELECT id, name, country, region, cost_index, popularity, image_url
       FROM cities
       ${where}
       ORDER BY popularity DESC, name ASC
       LIMIT 50`,
      params
    );

    return NextResponse.json({ cities: rows });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to search cities";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
