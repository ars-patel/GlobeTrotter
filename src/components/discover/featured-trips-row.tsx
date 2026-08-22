import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
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
    <article className="flex h-full flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-sm transition hover:shadow-md">
      <div className="aspect-16/10 bg-muted">
        {trip.cover_photo ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={trip.cover_photo}
            alt=""
            className="size-full object-cover"
          />
        ) : (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src="/marketing/coast.jpg"
            alt=""
            className="size-full object-cover opacity-80"
          />
        )}
      </div>
      <div className="flex flex-1 flex-col p-4">
        <h3 className="font-semibold leading-snug">{trip.name}</h3>
        <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">
          {trip.description ||
            [trip.start_point, trip.end_point].filter(Boolean).join(" → ") ||
            "Featured itinerary"}
        </p>
        <p className="mt-2 text-xs text-muted-foreground">
          {String(trip.start_date).slice(0, 10)} –{" "}
          {String(trip.end_date).slice(0, 10)}
        </p>
        <Link
          href={tripHref(trip)}
          className={cn(buttonVariants({ size: "sm" }), "mt-4 w-fit")}
        >
          View itinerary
        </Link>
      </div>
    </article>
  );
}

export function FeaturedTripsRow({ trips }: { trips: FeaturedTripItem[] }) {
  return (
    <section className="space-y-4">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">
            Community
          </p>
          <h2 className="mt-1 font-display text-2xl font-bold tracking-tight">
            Featured trips
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Public plans for inspiration — copy ideas into your own itinerary.
          </p>
        </div>
        <Link
          href="/community"
          className={cn(buttonVariants({ variant: "outline", size: "sm" }))}
        >
          See more
        </Link>
      </div>

      {trips.length === 0 ? (
        <Empty className="border border-dashed">
          <EmptyHeader>
            <EmptyTitle>No featured trips yet</EmptyTitle>
            <EmptyDescription>
              Featured itineraries will appear here when travelers share them.
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
