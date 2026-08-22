import Link from "next/link";
import { redirect } from "next/navigation";
import { AppShell } from "@/components/layout/app-header";
import {
  TripListCard,
  type TripListItem,
} from "@/components/trips/trip-list-card";
import { buttonVariants } from "@/components/ui/button";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyTitle,
} from "@/components/ui/empty";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import { getCurrentUser } from "@/lib/auth/session";
import { query } from "@/lib/db";
import { cn } from "@/lib/utils";

function Segment({
  title,
  trips,
}: {
  title: string;
  trips: TripListItem[];
}) {
  return (
    <section className="space-y-3">
      <div className="flex items-baseline justify-between gap-2">
        <h2 className="text-lg font-semibold tracking-tight">{title}</h2>
        <span className="text-xs text-muted-foreground tabular-nums">
          {trips.length}
        </span>
      </div>
      {trips.length === 0 ? (
        <p className="text-sm text-muted-foreground">No trips in this group.</p>
      ) : (
        <div className="grid gap-3">
          {trips.map((t) => (
            <TripListCard key={t.id} trip={t} />
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
    const { rows } = await query<TripListItem>(
      `SELECT
         t.id, t.name, t.description,
         to_char(t.start_date, 'YYYY-MM-DD') AS start_date,
         to_char(t.end_date, 'YYYY-MM-DD') AS end_date,
         t.start_point, t.end_point,
         (SELECT COUNT(*)::int FROM trip_stops s WHERE s.trip_id = t.id) AS destination_count
       FROM trips t
       WHERE t.user_id = $1
       ORDER BY t.start_date ASC, t.created_at DESC`,
      [user.id]
    );

    const today = new Date().toISOString().slice(0, 10);
    const ongoing: TripListItem[] = [];
    const upcoming: TripListItem[] = [];
    const completed: TripListItem[] = [];
    for (const trip of rows) {
      const start = String(trip.start_date).slice(0, 10);
      const end = String(trip.end_date).slice(0, 10);
      if (start <= today && today <= end) ongoing.push(trip);
      else if (start > today) upcoming.push(trip);
      else completed.push(trip);
    }

    return (
      <AppShell user={user}>
        <main className="mx-auto w-full max-w-3xl flex-1 space-y-8 px-6 py-10">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <h1 className="text-2xl font-semibold tracking-tight">My Trips</h1>
              <p className="text-sm text-muted-foreground">
                View, edit, or delete your travel plans · Ongoing, upcoming, and
                completed
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
            <div className="space-y-8">
              <Segment title="Ongoing" trips={ongoing} />
              <Separator />
              <Segment title="Upcoming" trips={upcoming} />
              <Separator />
              <Segment title="Completed" trips={completed} />
            </div>
          )}
        </main>
      </AppShell>
    );
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to load trips";
    return (
      <AppShell user={user}>
        <main className="mx-auto w-full max-w-3xl flex-1 px-6 py-10">
          <Alert variant="destructive">
            <AlertDescription>{message}</AlertDescription>
          </Alert>
        </main>
      </AppShell>
    );
  }
}
