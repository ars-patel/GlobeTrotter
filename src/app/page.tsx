import { query } from "@/lib/db";
import { MarketingShell } from "@/components/marketing/marketing-shell";
import { SiteNavbar } from "@/components/marketing/site-navbar";
import { MarketingHero } from "@/components/marketing/marketing-hero";
import { FeatureGrid } from "@/components/marketing/feature-grid";
import { BookingStepsPreview } from "@/components/marketing/booking-steps-preview";
import { DestinationRow } from "@/components/marketing/destination-row";
import { TrendingTrips } from "@/components/marketing/trending-trips";
import { WhyChooseUs } from "@/components/marketing/why-choose-us";
import { ReviewsSection } from "@/components/marketing/reviews-section";
import { FinalCta } from "@/components/marketing/final-cta";
import { SiteFooter } from "@/components/marketing/site-footer";
import { JOURNEY_SELECT, type JourneyRow } from "@/lib/journeys";

export default async function HomePage() {
  let heroImage = "/marketing/hero.jpg";
  let heroAlt = "Travel horizon at golden hour";
  let destinations: {
    id: string;
    name: string;
    country: string;
    description: string | null;
    starting_price: number | null;
    image_url: string | null;
  }[] = [];
  let categories: {
    id: string;
    slug: string;
    title: string;
    description: string;
    icon: string;
    image_url: string | null;
  }[] = [];
  let journeys: JourneyRow[] = [];
  let reviews: {
    id: string;
    author_name: string;
    rating: number;
    title: string | null;
    body: string;
    is_demo: boolean;
  }[] = [];

  try {
    const settings = await query<{ key: string; value: string }>(
      `SELECT key, value FROM app_settings
       WHERE key IN ('home.hero_image', 'home.hero_alt', 'discover.banner_url', 'discover.banner_alt')`
    );
    const map = Object.fromEntries(settings.rows.map((r) => [r.key, r.value]));
    heroImage =
      map["home.hero_image"] || map["discover.banner_url"] || heroImage;
    heroAlt = map["home.hero_alt"] || map["discover.banner_alt"] || heroAlt;

    const destRes = await query<{
      id: string;
      name: string;
      country: string;
      description: string | null;
      starting_price: number | null;
      image_url: string | null;
    }>(
      `SELECT id, name, country, description,
              starting_price::float8 AS starting_price, image_url
       FROM cities
       ORDER BY popularity DESC, name ASC
       LIMIT 8`
    );
    destinations = destRes.rows;

    const catRes = await query<{
      id: string;
      slug: string;
      title: string;
      description: string;
      icon: string;
      image_url: string | null;
    }>(
      `SELECT id, slug, title, description, icon, image_url
       FROM travel_categories
       ORDER BY sort_order ASC`
    );
    categories = catRes.rows;

    const journeyRes = await query<JourneyRow>(
      `SELECT ${JOURNEY_SELECT}
       FROM journeys j
       JOIN cities fc ON fc.id = j.from_city_id
       JOIN cities tc ON tc.id = j.to_city_id
       JOIN operators o ON o.id = j.operator_id
       LEFT JOIN travel_categories cat ON cat.id = j.category_id
       WHERE j.is_featured = TRUE AND j.seats_available > 0
       ORDER BY j.departure_at ASC
       LIMIT 6`
    );
    journeys = journeyRes.rows;

    const reviewRes = await query<{
      id: string;
      author_name: string;
      rating: number;
      title: string | null;
      body: string;
      is_demo: boolean;
    }>(
      `SELECT id, author_name, rating::float8 AS rating, title, body, is_demo
       FROM reviews
       ORDER BY created_at DESC
       LIMIT 6`
    );
    reviews = reviewRes.rows;
  } catch {
    // Keep marketing shell if DB briefly unavailable.
  }

  return (
    <MarketingShell>
      <div className="flex min-h-full flex-1 flex-col bg-background">
        <SiteNavbar />
        <MarketingHero
          imageUrl={heroImage}
          imageAlt={heroAlt}
          destinations={destinations.map((d) => ({
            id: d.id,
            name: d.name,
            country: d.country,
          }))}
        />
        <DestinationRow cities={destinations} />
        <FeatureGrid categories={categories} />
        <TrendingTrips trips={journeys} />
        <WhyChooseUs />
        <BookingStepsPreview />
        <ReviewsSection reviews={reviews} />
        <FinalCta />
        <SiteFooter />
      </div>
    </MarketingShell>
  );
}
