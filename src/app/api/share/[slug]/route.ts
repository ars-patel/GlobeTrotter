import { NextResponse } from "next/server";
import { query } from "@/lib/db";
import { getTripItinerary } from "@/lib/trips/queries";
import { toDateString } from "@/lib/dates";

export const runtime = "nodejs";

type Ctx = { params: Promise<{ slug: string }> };

/** Public read-only itinerary payload for a share slug. */
export async function GET(_req: Request, ctx: Ctx) {
  const { slug: raw } = await ctx.params;
  let slug = raw.trim();
  try {
    slug = decodeURIComponent(slug);
  } catch {
    /* keep trimmed raw */
  }

  const { rows } = await query(
    `SELECT
       id::text AS id, name, description, cover_photo,
       to_char(start_date, 'YYYY-MM-DD') AS start_date,
       to_char(end_date, 'YYYY-MM-DD') AS end_date,
       start_point, end_point, budget_limit, share_slug
     FROM trips
     WHERE share_slug = $1 AND is_public = TRUE
     LIMIT 1`,
    [slug]
  );
  const trip = rows[0];
  if (!trip) {
    return NextResponse.json({ error: "Shared trip not found" }, { status: 404 });
  }

  const { stops, activities } = await getTripItinerary(String(trip.id));
  const stopIds = new Set(stops.map((s) => String(s.id)));

  const activityTotal = activities
    .filter((a) => stopIds.has(String(a.stop_id)))
    .reduce((sum, a) => sum + Number(a.custom_cost ?? a.cost ?? 0), 0);

  return NextResponse.json({
    trip: {
      id: String(trip.id),
      name: trip.name,
      description: trip.description,
      cover_photo: trip.cover_photo,
      start_date: toDateString(trip.start_date),
      end_date: toDateString(trip.end_date),
      start_point: trip.start_point,
      end_point: trip.end_point,
      budget_limit:
        trip.budget_limit == null ? null : Number(trip.budget_limit),
      share_slug: trip.share_slug,
    },
    stops: stops.map((s) => ({
      id: String(s.id),
      city_name: String(s.city_name),
      country: String(s.country ?? ""),
      start_date: toDateString(s.start_date),
      end_date: toDateString(s.end_date),
      stop_order: Number(s.stop_order),
    })),
    activities: activities
      .filter((a) => stopIds.has(String(a.stop_id)))
      .map((a) => ({
        id: String(a.id),
        stop_id: String(a.stop_id),
        activity_name: String(a.activity_name),
        day_date: toDateString(a.day_date),
        start_time: a.start_time ? String(a.start_time) : null,
        end_time: a.end_time ? String(a.end_time) : null,
        type: a.type ? String(a.type) : null,
        cost: Number(a.custom_cost ?? a.cost ?? 0),
      })),
    summary: {
      stopCount: stops.length,
      activityCount: activities.filter((a) => stopIds.has(String(a.stop_id)))
        .length,
      estimatedCost: activityTotal,
      cities: [...new Set(stops.map((s) => String(s.city_name)))],
    },
  });
}
