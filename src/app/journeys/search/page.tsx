import Link from "next/link";
import { query } from "@/lib/db";
import {
  JOURNEY_SELECT,
  journeySearchSchema,
  type JourneyRow,
} from "@/lib/journeys";
import { MarketingShell } from "@/components/marketing/marketing-shell";
import { SiteNavbar } from "@/components/marketing/site-navbar";
import { SiteFooter } from "@/components/marketing/site-footer";
import { BookingSearchCard } from "@/components/marketing/booking-search-card";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type Props = {
  searchParams: Promise<Record<string, string | undefined>>;
};

export default async function JourneySearchPage({ searchParams }: Props) {
  const sp = await searchParams;
  const parsed = journeySearchSchema.safeParse({
    from: sp.from ?? "",
    to: sp.to ?? "",
    departure: sp.departure ?? "",
    returnDate: sp.return || undefined,
    passengers: sp.passengers ?? "1",
  });

  const destRes = await query<{ id: string; name: string; country: string }>(
    `SELECT id, name, country FROM cities ORDER BY name ASC`
  );

  let journeys: JourneyRow[] = [];
  let searchError: string | null = null;

  if (parsed.success) {
    const { from, to, departure, passengers } = parsed.data;
    const { rows } = await query<JourneyRow>(
      `SELECT ${JOURNEY_SELECT}
       FROM journeys j
       JOIN cities fc ON fc.id = j.from_city_id
       JOIN cities tc ON tc.id = j.to_city_id
       JOIN operators o ON o.id = j.operator_id
       LEFT JOIN travel_categories cat ON cat.id = j.category_id
       WHERE j.seats_available >= $1
         AND DATE(j.departure_at AT TIME ZONE 'UTC') >= $2::date
         AND (fc.name ILIKE $3 OR fc.country ILIKE $3)
         AND (tc.name ILIKE $4 OR tc.country ILIKE $4)
       ORDER BY j.price ASC, j.departure_at ASC
       LIMIT 50`,
      [passengers, departure, `%${from}%`, `%${to}%`]
    );
    journeys = rows;
  } else if (sp.from || sp.to || sp.departure) {
    searchError = parsed.error.issues[0]?.message ?? "Invalid search";
  }

  return (
    <MarketingShell>
      <div className="flex min-h-full flex-1 flex-col">
        <SiteNavbar />
        <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-8 sm:px-6">
          <h1 className="font-display text-3xl font-bold tracking-tight">
            Search results
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Journeys queried from PostgreSQL with your filters preserved in the
            URL.
          </p>

          <div className="mt-6">
            <BookingSearchCard destinations={destRes.rows} compact />
          </div>

          {searchError ? (
            <p className="mt-6 text-sm text-destructive">{searchError}</p>
          ) : null}

          <div className="mt-8 space-y-4">
            {journeys.map((j) => (
              <article
                key={j.id}
                className="flex flex-col gap-4 rounded-2xl border border-border bg-card p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between"
              >
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="text-lg font-semibold">
                      {j.from_city} → {j.to_city}
                    </h2>
                    {j.category_title ? (
                      <Badge variant="secondary">{j.category_title}</Badge>
                    ) : null}
                  </div>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {new Date(j.departure_at).toLocaleString()} ·{" "}
                    {Number(j.duration_hours).toFixed(1)} hrs · {j.operator_name}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {j.seats_available} of {j.seats_total} seats available
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <p className="text-xl font-bold text-primary">
                    ${Number(j.price).toFixed(0)}
                  </p>
                  <Link
                    href={`/?auth=login&next=${encodeURIComponent(`/bookings?journey=${j.id}`)}`}
                    className={cn(buttonVariants({ size: "sm" }))}
                  >
                    Book Now
                  </Link>
                </div>
              </article>
            ))}
          </div>

          {parsed.success && journeys.length === 0 ? (
            <div className="mt-10 rounded-2xl border border-dashed p-8 text-center">
              <p className="font-medium">No journeys match this search</p>
              <p className="mt-1 text-sm text-muted-foreground">
                Try Paris → Barcelona from Sep 5, 2026, or broaden the date.
              </p>
              <Link
                href="/journeys/search?from=Paris&to=Barcelona&departure=2026-09-05&passengers=1"
                className={cn(buttonVariants({ size: "sm" }), "mt-4")}
              >
                Try sample search
              </Link>
            </div>
          ) : null}

          {!parsed.success && !searchError ? (
            <p className="mt-8 text-sm text-muted-foreground">
              Enter From, To, and Departure above to search available journeys.
            </p>
          ) : null}
        </main>
        <SiteFooter />
      </div>
    </MarketingShell>
  );
}
