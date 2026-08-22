import { NextRequest, NextResponse } from "next/server";
import { query } from "@/lib/db";
import { requireUser } from "@/lib/auth/require-user";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  const auth = await requireUser();
  if (auth.error) return auth.error;

  try {
    const sp = request.nextUrl.searchParams;
    const cityId = sp.get("cityId");
    const type = sp.get("type");
    const q = sp.get("q")?.trim();
    const maxCost = sp.get("maxCost");

    const clauses: string[] = [];
    const params: unknown[] = [];

    if (cityId) {
      params.push(cityId);
      clauses.push(`a.city_id = $${params.length}`);
    }
    if (type) {
      params.push(type);
      clauses.push(`a.type = $${params.length}`);
    }
    if (q) {
      params.push(`%${q}%`);
      clauses.push(`(a.name ILIKE $${params.length} OR a.description ILIKE $${params.length})`);
    }
    if (maxCost != null && maxCost !== "") {
      params.push(Number(maxCost));
      clauses.push(`a.cost <= $${params.length}`);
    }

    const where = clauses.length ? `WHERE ${clauses.join(" AND ")}` : "";
    const { rows } = await query(
      `SELECT a.id, a.city_id, a.name, a.description, a.type, a.cost, a.duration_hrs, a.image_url,
              c.name AS city_name, c.country, c.latitude, c.longitude
       FROM activities a
       JOIN cities c ON c.id = a.city_id
       ${where}
       ORDER BY a.name ASC
       LIMIT 50`,
      params
    );

    return NextResponse.json({ activities: rows });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to load activities";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
