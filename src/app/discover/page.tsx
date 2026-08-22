import { redirect } from "next/navigation";
import { AppHeader } from "@/components/layout/app-header";
import { HeroBanner } from "@/components/discover/hero-banner";
import { TopDestinationsRow } from "@/components/discover/top-destinations-row";
import { FeaturedTripsRow } from "@/components/discover/featured-trips-row";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { getCurrentUser } from "@/lib/auth/session";
import { query } from "@/lib/db";

async function loadDiscoverData() {
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
       id, name, description, cover_photo,
       start_date, end_date, start_point, end_point,
       is_public, share_slug, budget_limit
     FROM trips
     WHERE is_featured = TRUE
        OR (is_public = TRUE AND share_slug IS NOT NULL)
     ORDER BY is_featured DESC, created_at DESC
     LIMIT 3`
  );

  return {
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
  };
}

export default async function DiscoverPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  try {
    const data = await loadDiscoverData();

    return (
      <div className="flex min-h-full flex-1 flex-col">
        <AppHeader user={user} />
        <HeroBanner
          url={data.banner.url}
          alt={data.banner.alt}
          title={data.banner.title}
          subtitle={data.banner.subtitle}
          userDisplayName={user.first_name}
        />
        <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-12 px-6 py-10">
          <TopDestinationsRow cities={data.topDestinations as never[]} />
          <FeaturedTripsRow trips={data.featuredTrips as never[]} />
        </main>
      </div>
    );
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to load Discover";
    return (
      <div className="flex min-h-full flex-1 flex-col">
        <AppHeader user={user} />
        <main className="mx-auto w-full max-w-6xl flex-1 px-6 py-10">
          <Alert variant="destructive">
            <AlertDescription>{message}</AlertDescription>
          </Alert>
        </main>
      </div>
    );
  }
}
