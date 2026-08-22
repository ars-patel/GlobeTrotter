import { query } from "@/lib/db";
import { MarketingShell } from "@/components/marketing/marketing-shell";
import { SiteNavbar } from "@/components/marketing/site-navbar";
import { MarketingHero } from "@/components/marketing/marketing-hero";
import { FeatureGrid } from "@/components/marketing/feature-grid";
import { BookingStepsPreview } from "@/components/marketing/booking-steps-preview";
import { DestinationRow } from "@/components/marketing/destination-row";
import { WhyChooseUs } from "@/components/marketing/why-choose-us";
import { ReviewsSection } from "@/components/marketing/reviews-section";
import { FinalCta } from "@/components/marketing/final-cta";
import { SiteFooter } from "@/components/marketing/site-footer";

export default async function HomePage() {
  let heroImage = "/marketing/hero.jpg";
  let heroAlt = "Traveler overlooking a scenic horizon";
  let destinations: {
    id: string;
    name: string;
    country: string;
    description: string | null;
    starting_price: number | null;
    image_url: string | null;
  }[] = [];
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
        <MarketingHero imageUrl={heroImage} imageAlt={heroAlt} />
        <DestinationRow cities={destinations} />
        <BookingStepsPreview />
        <FeatureGrid />
        <WhyChooseUs />
        <ReviewsSection reviews={reviews} />
        <FinalCta />
        <SiteFooter />
      </div>
    </MarketingShell>
  );
}
