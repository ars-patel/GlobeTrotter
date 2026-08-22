import Link from "next/link";
import { AddCityToTripButton } from "@/components/search/add-city-to-trip-button";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export type CitySearchItem = {
  id: string;
  name: string;
  country: string;
  region: string | null;
  cost_index: string | number;
  popularity: number;
  image_url?: string | null;
  description?: string | null;
  starting_price?: number | null;
};

export function CitySearchCard({
  city,
  tripId,
}: {
  city: CitySearchItem;
  tripId?: string;
}) {
  return (
    <article className="group overflow-hidden rounded-2xl border border-border bg-card shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
      <div className="grid sm:grid-cols-[180px_1fr]">
        <div className="relative aspect-4/3 bg-muted sm:aspect-auto sm:min-h-[160px]">
          {city.image_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={city.image_url}
              alt=""
              className="size-full object-cover transition duration-500 group-hover:scale-105"
            />
          ) : (
            <div className="flex size-full items-center justify-center text-sm text-muted-foreground">
              {city.name}
            </div>
          )}
        </div>

        <div className="flex flex-col p-4 sm:p-5">
          <div className="flex flex-wrap items-start justify-between gap-2">
            <div>
              <h2 className="font-display text-xl font-bold tracking-tight">
                {city.name}
              </h2>
              <p className="mt-0.5 text-sm text-muted-foreground">
                {city.country}
                {city.region ? ` · ${city.region}` : ""}
              </p>
            </div>
            {city.starting_price != null ? (
              <p className="text-sm font-semibold text-primary">
                From ${Number(city.starting_price).toFixed(0)}
              </p>
            ) : null}
          </div>

          {city.description ? (
            <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-muted-foreground">
              {city.description}
            </p>
          ) : null}

          <div className="mt-3 flex flex-wrap gap-2">
            <Badge variant="secondary">Popularity {city.popularity}</Badge>
            <Badge variant="outline">
              Cost ×{Number(city.cost_index).toFixed(2)}
            </Badge>
          </div>

          <div className="mt-4 flex flex-wrap gap-2">
            <AddCityToTripButton
              cityId={city.id}
              cityName={city.name}
              preferredTripId={tripId}
            />
            <Link
              href={`/search?type=activity&cityId=${encodeURIComponent(city.id)}`}
              className={cn(buttonVariants({ variant: "outline", size: "sm" }))}
            >
              View activities
            </Link>
            <Link
              href={`/journeys/search?to=${encodeURIComponent(city.name)}&from=Paris&departure=2026-09-01&passengers=1`}
              className={cn(buttonVariants({ variant: "ghost", size: "sm" }))}
            >
              Find journeys
            </Link>
          </div>
        </div>
      </div>
    </article>
  );
}
