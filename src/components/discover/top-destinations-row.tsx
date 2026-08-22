import Link from "next/link";
import { DestinationCard, type DestinationItem } from "@/components/discover/destination-card";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyTitle,
} from "@/components/ui/empty";

export function TopDestinationsRow({ cities }: { cities: DestinationItem[] }) {
  return (
    <section className="space-y-4">
      <div className="flex items-end justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold tracking-tight">
            Recommended destinations
          </h2>
          <p className="text-sm text-muted-foreground">
            Popular cities from the live catalog
          </p>
        </div>
        <Link
          href="/search?type=city"
          className="text-sm text-muted-foreground underline-offset-4 hover:underline"
        >
          See all
        </Link>
      </div>

      {cities.length === 0 ? (
        <Empty className="border border-dashed">
          <EmptyHeader>
            <EmptyTitle>No destinations yet</EmptyTitle>
            <EmptyDescription>
              Run database seeds to load cities into PostgreSQL.
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
