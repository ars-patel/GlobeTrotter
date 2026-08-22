import Link from "next/link";
import { DestinationCard, type DestinationItem } from "@/components/discover/destination-card";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyTitle,
} from "@/components/ui/empty";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function TopDestinationsRow({ cities }: { cities: DestinationItem[] }) {
  return (
    <section className="space-y-4">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">
            Inspiration
          </p>
          <h2 className="mt-1 font-display text-2xl font-bold tracking-tight">
            Recommended destinations
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Tap a city to search activities — or use it as a stop on a new trip.
          </p>
        </div>
        <Link
          href="/search?type=city"
          className={cn(buttonVariants({ variant: "outline", size: "sm" }))}
        >
          See all cities
        </Link>
      </div>

      {cities.length === 0 ? (
        <Empty className="border border-dashed">
          <EmptyHeader>
            <EmptyTitle>No destinations yet</EmptyTitle>
            <EmptyDescription>
              Destinations will show up here once they are available.
            </EmptyDescription>
          </EmptyHeader>
        </Empty>
      ) : (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-5">
          {cities.map((city) => (
            <DestinationCard key={city.id} city={city} />
          ))}
        </div>
      )}
    </section>
  );
}
