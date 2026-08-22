import { NextResponse } from "next/server";
import { query } from "@/lib/db";
import { requireUser } from "@/lib/auth/require-user";

export const runtime = "nodejs";

export async function GET() {
  const auth = await requireUser();
  if (auth.error) return auth.error;

  try {
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

    return NextResponse.json({
      userDisplayName: auth.user.first_name,
      banner: {
        url: map["discover.banner_url"] ?? null,
        alt: map["discover.banner_alt"] ?? "Travel inspiration",
        title: map["discover.hero_title"] ?? "Discover your next journey",
        subtitle:
          map["discover.hero_subtitle"] ??
          "Explore destinations and featured trips.",
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
