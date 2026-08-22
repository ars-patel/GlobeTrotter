import Link from "next/link";
import { redirect } from "next/navigation";
import { AppHeader } from "@/components/layout/app-header";
import { DeleteTripButton } from "@/components/trips/delete-trip-button";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import {
  Card,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyTitle,
} from "@/components/ui/empty";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { getCurrentUser } from "@/lib/auth/session";
import { query } from "@/lib/db";
import { cn } from "@/lib/utils";

type TripRow = {
  id: string;
  name: string;
  description: string | null;
  start_date: string;
  end_date: string;
  start_point: string | null;
  end_point: string | null;
  destination_count: number;
};

function TripCard({ trip }: { trip: TripRow }) {
  return (
    <Card className="border-border shadow-none">
      <CardHeader className="gap-2">
        <CardTitle className="text-base">{trip.name}</CardTitle>
        <CardDescription>
          {String(trip.start_date).slice(0, 10)} – {String(trip.end_date).slice(0, 10)}
          {trip.start_point || trip.end_point
            ? ` · ${[trip.start_point, trip.end_point].filter(Boolean).join(" → ")}`
            : ""}
        </CardDescription>
        <Badge variant="secondary">{trip.destination_count} destinations</Badge>
      </CardHeader>
      <CardFooter className="flex flex-wrap gap-2">
        <Link
          href={`/trips/${trip.id}/itinerary`}
          className={cn(buttonVariants({ size: "sm" }))}
        >
          View
        </Link>
        <Link
          href={`/trips/${trip.id}/builder`}
          className={cn(buttonVariants({ variant: "outline", size: "sm" }))}
        >
          Builder
        </Link>
        <Link
          href={`/trips/${trip.id}/edit`}
          className={cn(buttonVariants({ variant: "ghost", size: "sm" }))}
        >
          Edit
        </Link>
        <DeleteTripButton tripId={trip.id} />
      </CardFooter>
    </Card>
  );
}

function Segment({
  title,
  trips,
}: {
  title: string;
  trips: TripRow[];
}) {
  return (
    <section className="space-y-3">
      <h2 className="text-lg font-semibold tracking-tight">{title}</h2>
      {trips.length === 0 ? (
        <p className="text-sm text-muted-foreground">None</p>
      ) : (
        <div className="grid gap-3">
          {trips.map((t) => (
            <TripCard key={t.id} trip={t} />
          ))}
        </div>
      )}
    </section>
  );
}

export default async function TripsPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  try {
    const { rows } = await query<TripRow>(
      `SELECT
         t.id, t.name, t.description, t.start_date, t.end_date,
         t.start_point, t.end_point,
         (SELECT COUNT(*)::int FROM trip_stops s WHERE s.trip_id = t.id) AS destination_count
       FROM trips t
       WHERE t.user_id = $1
       ORDER BY t.start_date ASC`,
      [user.id]
    );

    const today = new Date().toISOString().slice(0, 10);
    const ongoing: TripRow[] = [];
    const upcoming: TripRow[] = [];
    const completed: TripRow[] = [];
    for (const trip of rows) {
      const start = String(trip.start_date).slice(0, 10);
      const end = String(trip.end_date).slice(0, 10);
      if (start <= today && today <= end) ongoing.push(trip);
      else if (start > today) upcoming.push(trip);
      else completed.push(trip);
    }

    return (
      <div className="flex min-h-full flex-1 flex-col">
        <AppHeader user={user} />
        <main className="mx-auto w-full max-w-3xl flex-1 space-y-10 px-6 py-10">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <h1 className="text-2xl font-semibold tracking-tight">Your Trip History</h1>
              <p className="text-sm text-muted-foreground">
                Ongoing, upcoming, and completed plans
              </p>
            </div>
            <Link href="/trips/new" className={cn(buttonVariants())}>
              Plan New Trip
            </Link>
          </div>

          {rows.length === 0 ? (
            <Empty className="border border-dashed">
              <EmptyHeader>
                <EmptyTitle>No trips yet</EmptyTitle>
                <EmptyDescription>
                  Plan your first multi-city adventure.
                </EmptyDescription>
              </EmptyHeader>
              <Link href="/trips/new" className={cn(buttonVariants())}>
                Plan Your First Trip
              </Link>
            </Empty>
          ) : (
            <>
              <Segment title="Ongoing" trips={ongoing} />
              <Segment title="Upcoming" trips={upcoming} />
              <Segment title="Completed" trips={completed} />
            </>
          )}
        </main>
      </div>
    );
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to load trips";
    return (
      <div className="flex min-h-full flex-1 flex-col">
        <AppHeader user={user} />
        <main className="mx-auto w-full max-w-3xl flex-1 px-6 py-10">
          <Alert variant="destructive">
            <AlertDescription>{message}</AlertDescription>
          </Alert>
        </main>
      </div>
    );
  }
}
