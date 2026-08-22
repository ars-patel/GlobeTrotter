import Link from "next/link";
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
      <div className="flex items-end justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold tracking-tight">Your trips</h2>
          <p className="text-sm text-muted-foreground">
            Recent and upcoming plans at a glance
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href="/trips/new"
            className={cn(buttonVariants({ size: "sm" }))}
          >
            Plan New Trip
          </Link>
          <Link
            href="/trips"
            className="text-sm text-muted-foreground underline-offset-4 hover:underline"
          >
            See all
          </Link>
        </div>
      </div>

      {trips.length === 0 ? (
        <Empty className="border border-dashed">
          <EmptyHeader>
            <EmptyTitle>No trips yet</EmptyTitle>
            <EmptyDescription>
              Start with Plan New Trip to build your first multi-city itinerary.
            </EmptyDescription>
          </EmptyHeader>
          <Link href="/trips/new" className={cn(buttonVariants({ size: "sm" }), "mt-2")}>
            Plan New Trip
          </Link>
        </Empty>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {trips.map((trip) => (
            <Card key={trip.id} className="border-border shadow-none">
              <CardHeader className="gap-2">
                <div className="flex items-start justify-between gap-2">
                  <CardTitle className="text-base">{trip.name}</CardTitle>
                  {statusBadge(trip.status)}
                </div>
                <CardDescription>
                  {String(trip.start_date).slice(0, 10)} –{" "}
                  {String(trip.end_date).slice(0, 10)}
                  {trip.start_point || trip.end_point
                    ? ` · ${[trip.start_point, trip.end_point].filter(Boolean).join(" → ")}`
                    : ""}
                </CardDescription>
                <p className="text-xs text-muted-foreground">
                  {trip.destination_count} destination
                  {trip.destination_count === 1 ? "" : "s"}
                </p>
              </CardHeader>
              <CardFooter className="gap-2">
                <Link
                  href={`/trips/${trip.id}/itinerary`}
                  className={cn(buttonVariants({ size: "sm" }))}
                >
                  Open
                </Link>
                <Link
                  href={`/trips/${trip.id}/builder`}
                  className={cn(buttonVariants({ variant: "outline", size: "sm" }))}
                >
                  Builder
                </Link>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </section>
  );
}
