import Link from "next/link";
import { StarIcon } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { JourneyRow } from "@/lib/journeys";

export function TrendingTrips({ trips }: { trips: JourneyRow[] }) {
  return (
    <section id="featured" className="scroll-mt-24 py-16 sm:py-20">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <h2 className="font-display text-3xl font-bold tracking-tight sm:text-4xl">
          Featured Journeys
        </h2>
        <p className="mt-2 max-w-2xl text-muted-foreground">
          Bookable trips with live seats and prices from the database.
        </p>

        <div className="mt-10 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {trips.map((t) => (
            <article
              key={t.id}
              className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm transition hover:shadow-md"
            >
              <div className="relative aspect-16/10 bg-muted">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={t.cover_image || "/marketing/coast.jpg"}
                  alt=""
                  className="size-full object-cover"
                />
                {t.is_featured ? (
                  <Badge className="absolute left-3 top-3">Featured</Badge>
                ) : null}
              </div>
              <div className="space-y-2 p-4">
                <h3 className="font-display text-xl font-bold tracking-tight">
                  {t.to_city}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {t.from_city} → {t.to_city}
                </p>
                <p className="text-sm text-muted-foreground">
                  Departs {new Date(t.departure_at).toLocaleString(undefined, {
                    dateStyle: "medium",
                    timeStyle: "short",
                  })}
                </p>
                <p className="text-sm text-muted-foreground">
                  {Number(t.duration_hours).toFixed(1)} hrs ·{" "}
                  {t.seats_available} seats left · {t.operator_name}
                </p>
                <div className="flex items-center justify-between gap-2 pt-1">
                  <p className="text-lg font-semibold text-primary">
                    ${Number(t.price).toFixed(0)}
                  </p>
                  {t.rating != null ? (
                    <span className="inline-flex items-center gap-1 text-sm font-medium">
                      <StarIcon className="size-3.5 fill-amber-400 text-amber-400" />
                      {Number(t.rating).toFixed(1)}
                    </span>
                  ) : null}
                </div>
                <Link
                  href={`/journeys/search?from=${encodeURIComponent(t.from_city)}&to=${encodeURIComponent(t.to_city)}&departure=${t.departure_at.slice(0, 10)}&passengers=1`}
                  className={cn(buttonVariants({ size: "sm" }), "mt-2")}
                >
                  Book Now
                </Link>
              </div>
            </article>
          ))}
        </div>

        {trips.length === 0 ? (
          <div className="mt-8 rounded-2xl border border-dashed border-border p-8 text-center">
            <p className="font-medium">No featured journeys yet</p>
            <p className="mt-1 text-sm text-muted-foreground">
              Seed journeys or add routes in the database to show trips here.
            </p>
          </div>
        ) : null}
      </div>
    </section>
  );
}
