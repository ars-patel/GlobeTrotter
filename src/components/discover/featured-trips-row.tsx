import Link from "next/link";
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

export type FeaturedTripItem = {
  id: string;
  name: string;
  description: string | null;
  cover_photo: string | null;
  start_date: string;
  end_date: string;
  start_point: string | null;
  end_point: string | null;
  is_public: boolean;
  share_slug: string | null;
};

function tripHref(trip: FeaturedTripItem) {
  if (trip.share_slug) return `/share/${trip.share_slug}`;
  return `/trips/${trip.id}/itinerary`;
}

export function FeaturedTripCard({ trip }: { trip: FeaturedTripItem }) {
  return (
    <Card className="flex h-full flex-col overflow-hidden border-border shadow-none">
      <div className="aspect-[16/10] bg-muted">
        {trip.cover_photo ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={trip.cover_photo}
            alt={trip.name}
            className="h-full w-full object-cover"
          />
        ) : null}
      </div>
      <CardHeader className="flex-1 gap-2">
        <CardTitle className="text-base">{trip.name}</CardTitle>
        <CardDescription className="line-clamp-2">
          {trip.description ||
            [trip.start_point, trip.end_point].filter(Boolean).join(" → ") ||
            "Featured itinerary"}
        </CardDescription>
        <p className="text-xs text-muted-foreground">
          {String(trip.start_date).slice(0, 10)} – {String(trip.end_date).slice(0, 10)}
        </p>
      </CardHeader>
      <CardFooter>
        <Link href={tripHref(trip)} className={cn(buttonVariants({ size: "sm" }))}>
          View
        </Link>
      </CardFooter>
    </Card>
  );
}

export function FeaturedTripsRow({ trips }: { trips: FeaturedTripItem[] }) {
  return (
    <section className="space-y-4">
      <div className="flex items-end justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold tracking-tight">Featured Trips</h2>
          <p className="text-sm text-muted-foreground">
            Inspiration from public and featured plans
          </p>
        </div>
        <Link
          href="/trips"
          className="text-sm text-muted-foreground underline-offset-4 hover:underline"
        >
          See more
        </Link>
      </div>

      {trips.length === 0 ? (
        <Empty className="border border-dashed">
          <EmptyHeader>
            <EmptyTitle>No featured trips yet</EmptyTitle>
            <EmptyDescription>
              Mark trips as featured in the database, or create your first trip.
            </EmptyDescription>
          </EmptyHeader>
        </Empty>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {trips.map((trip) => (
            <FeaturedTripCard key={trip.id} trip={trip} />
          ))}
        </div>
      )}
    </section>
  );
}
