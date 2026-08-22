import { NextResponse } from "next/server";
import { query } from "@/lib/db";
import { requireUser } from "@/lib/auth/require-user";

export const runtime = "nodejs";

export async function GET() {
  const auth = await requireUser();
  if (auth.error) return auth.error;

  try {
    const today = new Date().toISOString().slice(0, 10);
    const userId = auth.user.id;

    const settings = await query<{ key: string; value: string }>(
      `SELECT key, value FROM app_settings
       WHERE key IN (
         'discover.banner_url',
         'discover.banner_alt',
         'discover.hero_title',
         'discover.hero_subtitle'
       )`
    );
    const map = Object.fromEntries(settings.rows.map((r) => [r.key, r.value]));

    const destinations = await query(
      `SELECT id, name, country, region, cost_index, popularity, image_url
       FROM cities
       ORDER BY popularity DESC, name ASC
       LIMIT 5`
    );

    const featured = await query(
      `SELECT
         t.id, t.name, t.description, t.cover_photo,
         t.start_date, t.end_date, t.start_point, t.end_point,
         t.is_public, t.share_slug, t.budget_limit
       FROM trips t
       WHERE t.is_featured = TRUE
          OR (t.is_public = TRUE AND t.share_slug IS NOT NULL)
       ORDER BY t.is_featured DESC, t.created_at DESC
       LIMIT 3`
    );

    const recent = await query(
      `SELECT
         t.id, t.name, t.start_date, t.end_date, t.start_point, t.end_point,
         (SELECT COUNT(*)::int FROM trip_stops s WHERE s.trip_id = t.id) AS destination_count
       FROM trips t
       WHERE t.user_id = $1
       ORDER BY
         CASE
           WHEN t.start_date <= $2::date AND t.end_date >= $2::date THEN 0
           WHEN t.start_date > $2::date THEN 1
           ELSE 2
         END,
         t.start_date ASC,
         t.created_at DESC
       LIMIT 6`,
      [userId, today]
    );

    const budgetRows = await query(
      `SELECT
         t.id,
         t.name,
         t.budget_limit,
         t.start_date,
         t.end_date,
         (
           COALESCE((
             SELECT SUM(COALESCE(ta.custom_cost, a.cost, 0))
             FROM trip_stops s
             JOIN trip_activities ta ON ta.stop_id = s.id
             JOIN activities a ON a.id = ta.activity_id
             WHERE s.trip_id = t.id
           ), 0)
           +
           COALESCE((
             SELECT SUM(tc.amount) FROM trip_costs tc WHERE tc.trip_id = t.id
           ), 0)
         )::float AS estimated_spend
       FROM trips t
       WHERE t.user_id = $1
         AND t.end_date >= $2::date
       ORDER BY t.start_date ASC
       LIMIT 4`,
      [userId, today]
    );

    const budgetTrips = budgetRows.rows.map((r) => ({
      id: r.id,
      name: r.name,
      budget_limit: r.budget_limit == null ? null : Number(r.budget_limit),
      estimated_spend: Number(r.estimated_spend) || 0,
      start_date: r.start_date,
      end_date: r.end_date,
    }));

    return NextResponse.json({
      userDisplayName: auth.user.first_name,
      banner: {
        url: map["discover.banner_url"] ?? null,
        alt: map["discover.banner_alt"] ?? "Travel inspiration",
        title: map["discover.hero_title"] ?? "Discover your next journey",
        subtitle:
          map["discover.hero_subtitle"] ??
          "Explore destinations, review your trips, and keep budgets on track.",
      },
      recentTrips: recent.rows,
      budgetHighlights: {
        trips: budgetTrips,
        summary: {
          tripCount: budgetTrips.length,
          totalBudget: budgetTrips.reduce(
            (sum, t) => sum + (t.budget_limit ?? 0),
            0
          ),
          totalSpend: budgetTrips.reduce(
            (sum, t) => sum + t.estimated_spend,
            0
          ),
          tripsOverBudget: budgetTrips.filter(
            (t) =>
              t.budget_limit != null && t.estimated_spend > t.budget_limit
          ).length,
        },
      },
      topDestinations: destinations.rows,
      featuredTrips: featured.rows,
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to load discover";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
