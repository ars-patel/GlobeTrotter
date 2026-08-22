import { query } from "@/lib/db";
import { toDateString } from "@/lib/dates";
import { SiteHeader } from "@/components/marketing/site-header";
import { MarketingHero } from "@/components/marketing/marketing-hero";
import { FeatureGrid } from "@/components/marketing/feature-grid";
import { BookingStepsPreview } from "@/components/marketing/booking-steps-preview";
import { DestinationRow } from "@/components/marketing/destination-row";
import { TrendingTrips } from "@/components/marketing/trending-trips";
import { SiteFooter } from "@/components/marketing/site-footer";

export default async function HomePage() {
  const settings = await query<{ key: string; value: string }>(
    `SELECT key, value FROM app_settings
     WHERE key IN ('home.hero_image', 'home.hero_alt', 'discover.banner_url', 'discover.banner_alt')`
  );
  const map = Object.fromEntries(settings.rows.map((r) => [r.key, r.value]));
  const heroImage =
    map["home.hero_image"] ||
    map["discover.banner_url"] ||
    "/marketing/hero.jpg";
  const heroAlt =
    map["home.hero_alt"] ||
    map["discover.banner_alt"] ||
    "Travel horizon at golden hour";

  const cities = await query<{
    id: string;
    name: string;
    country: string;
    image_url: string | null;
    popularity: number;
  }>(
    `SELECT id, name, country, image_url, popularity
     FROM cities
     ORDER BY popularity DESC, name ASC
     LIMIT 8`
  );

  const trips = await query<{
    id: string;
    name: string;
    description: string | null;
    cover_photo: string | null;
    start_date: string;
    end_date: string;
    start_point: string | null;
    end_point: string | null;
    share_slug: string | null;
  }>(
    `SELECT
       id, name, description, cover_photo,
       to_char(start_date, 'YYYY-MM-DD') AS start_date,
       to_char(end_date, 'YYYY-MM-DD') AS end_date,
       start_point, end_point, share_slug
     FROM trips
     WHERE is_public = TRUE OR is_featured = TRUE
     ORDER BY is_featured DESC, created_at DESC
     LIMIT 6`
  );

  return (
    <div className="flex min-h-full flex-1 flex-col">
      <SiteHeader />
      <MarketingHero imageUrl={heroImage} imageAlt={heroAlt} />
      <div className="marketing-sky flex-1">
        <FeatureGrid />
        <DestinationRow
          cities={cities.rows.map((c) => ({
            id: c.id,
            name: c.name,
            country: c.country,
            image_url: c.image_url,
            popularity: Number(c.popularity),
          }))}
        />
        <BookingStepsPreview />
        <TrendingTrips
          trips={trips.rows.map((t) => ({
            id: t.id,
            name: t.name,
            description: t.description,
            cover_photo: t.cover_photo,
            start_date: toDateString(t.start_date),
            end_date: toDateString(t.end_date),
            start_point: t.start_point,
            end_point: t.end_point,
            share_slug: t.share_slug,
          }))}
        />
      </div>
      <SiteFooter />
    </div>
  );
}
