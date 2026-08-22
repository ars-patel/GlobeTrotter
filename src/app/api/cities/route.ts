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
    const limitRaw = Number(sp.get("limit") ?? 50);
    const limit = Number.isFinite(limitRaw)
      ? Math.min(Math.max(limitRaw, 1), 100)
      : 50;

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
      clauses.push(`country = $${params.length}`);
    }
    if (region) {
      params.push(region);
      clauses.push(`region = $${params.length}`);
    }

    const where = clauses.length ? `WHERE ${clauses.join(" AND ")}` : "";
    const order =
      sort === "name"
        ? "name ASC"
        : sort === "cost_index"
          ? "cost_index ASC, name ASC"
          : "popularity DESC, name ASC";

    params.push(limit);
    const { rows } = await query(
      `SELECT id, name, country, region, cost_index, popularity, image_url, latitude, longitude
       FROM cities
       ${where}
       ORDER BY ${order}
       LIMIT $${params.length}`,
      params
    );

    const countries = await query<{ country: string }>(
      `SELECT DISTINCT country FROM cities ORDER BY country ASC`
    );

    const regionParams: unknown[] = [];
    let regionWhere = `WHERE region IS NOT NULL AND TRIM(region) <> ''`;
    if (country) {
      regionParams.push(country);
      regionWhere += ` AND country = $1`;
    }
    const regions = await query<{ region: string }>(
      `SELECT DISTINCT region FROM cities ${regionWhere} ORDER BY region ASC`,
      regionParams
    );

    return NextResponse.json({
      cities: rows,
      meta: {
        countries: countries.rows.map((r) => r.country),
        regions: regions.rows.map((r) => r.region),
      },
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to search cities";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
