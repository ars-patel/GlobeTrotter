import { redirect } from "next/navigation";
import { AppShell } from "@/components/layout/app-header";
import { HeroBanner } from "@/components/discover/hero-banner";
import { DiscoverQuickActions } from "@/components/discover/discover-quick-actions";
import { TopDestinationsRow } from "@/components/discover/top-destinations-row";
import { FeaturedTripsRow } from "@/components/discover/featured-trips-row";
import { RecentTripsRow, type RecentTripItem } from "@/components/discover/recent-trips-row";
import {
  BudgetHighlights,
  type BudgetHighlightTrip,
} from "@/components/discover/budget-highlights";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { getCurrentUser } from "@/lib/auth/session";
import { query } from "@/lib/db";

function tripStatus(
  start: string,
  end: string,
  today: string
): RecentTripItem["status"] {
  if (start <= today && today <= end) return "ongoing";
  if (start > today) return "upcoming";
  return "completed";
}

async function loadDiscoverData(userId: string) {
  const today = new Date().toISOString().slice(0, 10);

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

  const recent = await query<{
    id: string;
    name: string;
    start_date: string;
    end_date: string;
    start_point: string | null;
    end_point: string | null;
    destination_count: number;
  }>(
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

  const budgetRows = await query<{
    id: string;
    name: string;
    budget_limit: string | number | null;
    estimated_spend: string | number;
    start_date: string;
    end_date: string;
  }>(
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

  const budgetTrips: BudgetHighlightTrip[] = budgetRows.rows.map((r) => ({
    id: r.id,
    name: r.name,
    budget_limit:
      r.budget_limit == null ? null : Number(r.budget_limit),
    estimated_spend: Number(r.estimated_spend) || 0,
    start_date: r.start_date,
    end_date: r.end_date,
  }));

  const summary = {
    tripCount: budgetTrips.length,
    totalBudget: budgetTrips.reduce(
      (sum, t) => sum + (t.budget_limit ?? 0),
      0
    ),
    totalSpend: budgetTrips.reduce((sum, t) => sum + t.estimated_spend, 0),
    tripsOverBudget: budgetTrips.filter(
      (t) => t.budget_limit != null && t.estimated_spend > t.budget_limit
    ).length,
  };

  const recentTrips: RecentTripItem[] = recent.rows.map((t) => ({
    ...t,
    status: tripStatus(
      String(t.start_date).slice(0, 10),
      String(t.end_date).slice(0, 10),
      today
    ),
  }));

  return {
    banner: {
      url: map["discover.banner_url"] ?? null,
      alt: map["discover.banner_alt"] ?? "Travel inspiration",
      title: map["discover.hero_title"] ?? "Your travel hub",
      subtitle:
        map["discover.hero_subtitle"] ??
        "Plan multi-city itineraries, book journeys, track budgets, and explore destinations — all from here.",
    },
    topDestinations: destinations.rows,
    featuredTrips: featured.rows,
    recentTrips,
    budgetTrips,
    budgetSummary: summary,
  };
}

export default async function DiscoverPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/?auth=login&next=/discover");

  try {
    const data = await loadDiscoverData(user.id);

    return (
      <AppShell user={user}>
        <HeroBanner
          url={data.banner.url}
          alt={data.banner.alt}
          title={data.banner.title}
          subtitle={data.banner.subtitle}
          userDisplayName={user.first_name}
          tripCount={data.budgetSummary.tripCount}
        />
        <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-14 px-4 py-10 sm:px-6">
          <DiscoverQuickActions />
          <RecentTripsRow trips={data.recentTrips} />
          <BudgetHighlights
            trips={data.budgetTrips}
            summary={data.budgetSummary}
          />
          <TopDestinationsRow cities={data.topDestinations as never[]} />
          <FeaturedTripsRow trips={data.featuredTrips as never[]} />
        </main>
      </AppShell>
    );
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to load Discover";
    return (
      <AppShell user={user}>
        <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-10 sm:px-6">
          <Alert variant="destructive">
            <AlertDescription>{message}</AlertDescription>
          </Alert>
        </main>
      </AppShell>
    );
  }
}
