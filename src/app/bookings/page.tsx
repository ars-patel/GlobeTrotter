import { redirect } from "next/navigation";
import Link from "next/link";
import { getCurrentUser } from "@/lib/auth/session";
import { query } from "@/lib/db";
import { AppShell } from "@/components/layout/app-header";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { BookJourneyButton } from "@/components/bookings/book-journey-button";

type Props = {
  searchParams: Promise<{ journey?: string }>;
};

export default async function BookingsPage({ searchParams }: Props) {
  const user = await getCurrentUser();
  if (!user) redirect("/?auth=login&next=/bookings");

  const sp = await searchParams;

  const { rows: bookings } = await query<{
    id: string;
    passengers: number;
    status: string;
    created_at: string;
    from_city: string;
    to_city: string;
    departure_at: string;
    price: number;
  }>(
    `SELECT
       b.id, b.passengers, b.status, b.created_at::text,
       fc.name AS from_city, tc.name AS to_city,
       j.departure_at::text, j.price::float8 AS price
     FROM journey_bookings b
     JOIN journeys j ON j.id = b.journey_id
     JOIN cities fc ON fc.id = j.from_city_id
     JOIN cities tc ON tc.id = j.to_city_id
     WHERE b.user_id = $1
     ORDER BY b.created_at DESC`,
    [user.id]
  );

  let pendingJourney: {
    id: string;
    from_city: string;
    to_city: string;
    departure_at: string;
    price: number;
    seats_available: number;
  } | null = null;

  if (sp.journey) {
    const { rows } = await query<{
      id: string;
      from_city: string;
      to_city: string;
      departure_at: string;
      price: number;
      seats_available: number;
    }>(
      `SELECT
         j.id, fc.name AS from_city, tc.name AS to_city,
         j.departure_at::text, j.price::float8 AS price, j.seats_available
       FROM journeys j
       JOIN cities fc ON fc.id = j.from_city_id
       JOIN cities tc ON tc.id = j.to_city_id
       WHERE j.id = $1`,
      [sp.journey]
    );
    pendingJourney = rows[0] ?? null;
  }

  return (
    <AppShell user={user}>
      <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-8 sm:px-6">
        <h1 className="font-display text-3xl font-bold tracking-tight">
          My Bookings
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Confirmed journey seats reserved against live availability.
        </p>

        {pendingJourney ? (
          <section className="mt-6 rounded-2xl border border-border bg-card p-4 shadow-sm">
            <h2 className="font-semibold">Complete booking</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              {pendingJourney.from_city} → {pendingJourney.to_city} ·{" "}
              {new Date(pendingJourney.departure_at).toLocaleString()} · $
              {Number(pendingJourney.price).toFixed(0)} ·{" "}
              {pendingJourney.seats_available} seats left
            </p>
            <div className="mt-3">
              <BookJourneyButton journeyId={pendingJourney.id} />
            </div>
          </section>
        ) : null}

        <div className="mt-8 space-y-3">
          {bookings.map((b) => (
            <article
              key={b.id}
              className="rounded-xl border border-border bg-card p-4"
            >
              <p className="font-semibold">
                {b.from_city} → {b.to_city}
              </p>
              <p className="text-sm text-muted-foreground">
                {new Date(b.departure_at).toLocaleString()} · {b.passengers}{" "}
                passenger(s) · {b.status}
              </p>
              <p className="mt-1 text-sm font-medium text-primary">
                ${Number(b.price).toFixed(0)} each
              </p>
            </article>
          ))}
        </div>

        {bookings.length === 0 && !pendingJourney ? (
          <div className="mt-10 rounded-2xl border border-dashed p-8 text-center">
            <p className="font-medium">No bookings yet</p>
            <p className="mt-1 text-sm text-muted-foreground">
              Search a journey and reserve seats to see them here.
            </p>
            <Link
              href="/journeys/search"
              className={cn(buttonVariants({ size: "sm" }), "mt-4")}
            >
              Search journeys
            </Link>
          </div>
        ) : null}
      </main>
    </AppShell>
  );
}
