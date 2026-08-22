import { NextRequest, NextResponse } from "next/server";
import { query } from "@/lib/db";
import { requireUser } from "@/lib/auth/require-user";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  const auth = await requireUser();
  if (auth.error) return auth.error;

  try {
    const sp = request.nextUrl.searchParams;
    const q = sp.get("q")?.trim() ?? "";
    const country = sp.get("country")?.trim();
    const region = sp.get("region")?.trim();
    const sort = sp.get("sort") ?? "popularity";

    const clauses: string[] = [];
    const params: unknown[] = [];

    if (q) {
      params.push(`%${q}%`);
      clauses.push(
        `(name ILIKE $${params.length} OR country ILIKE $${params.length} OR region ILIKE $${params.length})`
      );
    }
    if (country) {
      params.push(country);
      clauses.push(`country ILIKE $${params.length}`);
    }
    if (region) {
      params.push(region);
      clauses.push(`region ILIKE $${params.length}`);
    }

    const where = clauses.length ? `WHERE ${clauses.join(" AND ")}` : "";
    const order =
      sort === "name"
        ? "name ASC"
        : sort === "cost_index"
          ? "cost_index ASC"
          : "popularity DESC, name ASC";

    const { rows } = await query(
      `SELECT id, name, country, region, cost_index, popularity, image_url, latitude, longitude
       FROM cities
       ${where}
       ORDER BY ${order}
       LIMIT 50`,
      params
    );

    const meta = await query<{ country: string }>(
      `SELECT DISTINCT country FROM cities ORDER BY country ASC`
    );

    return NextResponse.json({
      cities: rows,
      meta: { countries: meta.rows.map((r) => r.country) },
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to search cities";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
