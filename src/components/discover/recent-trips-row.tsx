import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyTitle,
} from "@/components/ui/empty";
import { cn } from "@/lib/utils";

export type RecentTripItem = {
  id: string;
  name: string;
  start_date: string;
  end_date: string;
  start_point: string | null;
  end_point: string | null;
  destination_count: number;
  status: "ongoing" | "upcoming" | "completed";
};

function statusBadge(status: RecentTripItem["status"]) {
  if (status === "ongoing") return <Badge>Ongoing</Badge>;
  if (status === "upcoming") return <Badge variant="secondary">Upcoming</Badge>;
  return <Badge variant="outline">Completed</Badge>;
}

export function RecentTripsRow({ trips }: { trips: RecentTripItem[] }) {
  return (
    <section className="space-y-4">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">
            Your plans
          </p>
          <h2 className="mt-1 font-display text-2xl font-bold tracking-tight">
            Your trips
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Open a trip to edit stops, budget, or calendar — or start a new one.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Link href="/trips/new" className={cn(buttonVariants({ size: "sm" }))}>
            Plan New Trip
          </Link>
          <Link
            href="/trips"
            className={cn(buttonVariants({ variant: "outline", size: "sm" }))}
          >
            See all
          </Link>
        </div>
      </div>

      {trips.length === 0 ? (
        <Empty className="border border-dashed bg-card/50">
          <EmptyHeader>
            <EmptyTitle>No trips yet — this is your next step</EmptyTitle>
            <EmptyDescription>
              Create a multi-city itinerary. After that you can add stops,
              activities, and a budget from the trip pages.
            </EmptyDescription>
          </EmptyHeader>
          <Link
            href="/trips/new"
            className={cn(buttonVariants({ size: "sm" }), "mt-3")}
          >
            Create your first trip
          </Link>
        </Empty>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {trips.map((trip) => (
            <article
              key={trip.id}
              className="flex flex-col rounded-2xl border border-border bg-card p-4 shadow-sm transition hover:shadow-md"
            >
              <div className="flex items-start justify-between gap-2">
                <h3 className="text-base font-semibold leading-snug">
                  {trip.name}
                </h3>
                {statusBadge(trip.status)}
              </div>
              <p className="mt-2 text-sm text-muted-foreground">
                {String(trip.start_date).slice(0, 10)} –{" "}
                {String(trip.end_date).slice(0, 10)}
              </p>
              <p className="mt-1 text-sm text-muted-foreground">
                {trip.start_point || trip.end_point
                  ? `${[trip.start_point, trip.end_point].filter(Boolean).join(" → ")} · `
                  : ""}
                {trip.destination_count} stop
                {trip.destination_count === 1 ? "" : "s"}
              </p>
              <div className="mt-4 flex flex-wrap gap-2">
                <Link
                  href={`/trips/${trip.id}/itinerary`}
                  className={cn(buttonVariants({ size: "sm" }))}
                >
                  Open itinerary
                </Link>
                <Link
                  href={`/trips/${trip.id}/builder`}
                  className={cn(
                    buttonVariants({ variant: "outline", size: "sm" })
                  )}
                >
                  Edit stops
                </Link>
                <Link
                  href={`/trips/${trip.id}/budget`}
                  className={cn(
                    buttonVariants({ variant: "ghost", size: "sm" })
                  )}
                >
                  Budget
                </Link>
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
