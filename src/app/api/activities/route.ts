import { NextRequest, NextResponse } from "next/server";
import { query } from "@/lib/db";
import { requireUser } from "@/lib/auth/require-user";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  const auth = await requireUser();
  if (auth.error) return auth.error;

  try {
    const sp = request.nextUrl.searchParams;
    const cityId = sp.get("cityId")?.trim();
    const activityType = sp.get("activityType")?.trim() || sp.get("type")?.trim();
    const q = sp.get("q")?.trim();
    const country = sp.get("country")?.trim();
    const maxCost = sp.get("maxCost");
    const minCost = sp.get("minCost");
    const maxDuration = sp.get("maxDuration");
    const minDuration = sp.get("minDuration");

    const clauses: string[] = [];
    const params: unknown[] = [];

    // Ignore search-mode "activity"/"city" when type is used as UI tab
    const catalogType =
      activityType &&
      !["activity", "city"].includes(activityType.toLowerCase())
        ? activityType
        : null;

    if (cityId) {
      params.push(cityId);
      clauses.push(`a.city_id = $${params.length}`);
    }
    if (catalogType) {
      params.push(catalogType);
      clauses.push(`a.type = $${params.length}`);
    }
    if (q) {
      params.push(`%${q}%`);
      clauses.push(
        `(a.name ILIKE $${params.length} OR a.description ILIKE $${params.length} OR c.name ILIKE $${params.length})`
      );
    }
    if (country) {
      params.push(country);
      clauses.push(`c.country = $${params.length}`);
    }
    if (minCost != null && minCost !== "") {
      params.push(Number(minCost));
      clauses.push(`a.cost >= $${params.length}`);
    }
    if (maxCost != null && maxCost !== "") {
      params.push(Number(maxCost));
      clauses.push(`a.cost <= $${params.length}`);
    }
    if (minDuration != null && minDuration !== "") {
      params.push(Number(minDuration));
      clauses.push(`a.duration_hrs >= $${params.length}`);
    }
    if (maxDuration != null && maxDuration !== "") {
      params.push(Number(maxDuration));
      clauses.push(`a.duration_hrs <= $${params.length}`);
    }

    const where = clauses.length ? `WHERE ${clauses.join(" AND ")}` : "";
    const { rows } = await query(
      `SELECT a.id, a.city_id, a.name, a.description, a.type, a.cost, a.duration_hrs, a.image_url,
              c.name AS city_name, c.country, c.latitude, c.longitude
       FROM activities a
       JOIN cities c ON c.id = a.city_id
       ${where}
       ORDER BY a.cost ASC, a.name ASC
       LIMIT 50`,
      params
    );

    const types = await query<{ type: string }>(
      `SELECT DISTINCT type::text AS type FROM activities ORDER BY type ASC`
    );

    return NextResponse.json({
      activities: rows,
      meta: {
        types: types.rows.map((r) => r.type),
      },
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to load activities";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
