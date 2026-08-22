import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export type FeaturedItinerary = {
  id: string;
  name: string;
  description: string | null;
  cover_photo: string | null;
  start_date: string;
  end_date: string;
  start_point: string | null;
  end_point: string | null;
  share_slug: string | null;
  budget_limit: string | number | null;
};

export function TrendingTrips({ trips }: { trips: FeaturedItinerary[] }) {
  return (
    <section id="inspiration" className="scroll-mt-24 py-16 sm:py-20">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <h2 className="font-display text-3xl font-bold tracking-tight sm:text-4xl">
          Trip inspiration
        </h2>
        <p className="mt-2 max-w-2xl text-muted-foreground">
          Featured multi-city itineraries from travelers — open one to see how a
          plan comes together.
        </p>

        <div className="mt-10 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {trips.map((t) => {
            const href = t.share_slug
              ? `/share/${t.share_slug}`
              : "/?auth=login&next=/discover";
            const dates = `${String(t.start_date).slice(0, 10)} → ${String(t.end_date).slice(0, 10)}`;
            const route =
              t.start_point && t.end_point
                ? `${t.start_point} → ${t.end_point}`
                : null;

            return (
              <article
                key={t.id}
                className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm transition hover:shadow-md"
              >
                <div className="relative aspect-16/10 bg-muted">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={t.cover_photo || "/marketing/coast.jpg"}
                    alt=""
                    className="size-full object-cover"
                  />
                </div>
                <div className="space-y-2 p-4">
                  <h3 className="font-display text-xl font-bold tracking-tight">
                    {t.name}
                  </h3>
                  {route ? (
                    <p className="text-sm text-muted-foreground">{route}</p>
                  ) : null}
                  <p className="text-sm text-muted-foreground">{dates}</p>
                  {t.description ? (
                    <p className="line-clamp-2 text-sm text-muted-foreground">
                      {t.description}
                    </p>
                  ) : null}
                  <Link
                    href={href}
                    className={cn(buttonVariants({ size: "sm" }), "mt-2")}
                  >
                    View itinerary
                  </Link>
                </div>
              </article>
            );
          })}
        </div>

        {trips.length === 0 ? (
          <div className="mt-8 rounded-2xl border border-dashed border-border p-8 text-center">
            <p className="font-medium">Inspiration coming soon</p>
            <p className="mt-1 text-sm text-muted-foreground">
              Featured traveler itineraries will show up here.
            </p>
          </div>
        ) : null}
      </div>
    </section>
  );
}
