import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export type MarketingDestination = {
  id: string;
  name: string;
  country: string;
  description: string | null;
  starting_price: number | null;
  image_url: string | null;
};

export function DestinationRow({
  cities,
}: {
  cities: MarketingDestination[];
}) {
  return (
    <section id="destinations" className="scroll-mt-24 py-16 sm:py-20">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <h2 className="font-display text-3xl font-bold tracking-tight sm:text-4xl">
          Popular Destinations
        </h2>
        <p className="mt-2 max-w-2xl text-muted-foreground">
          Live catalog from our database — pick a city and start searching
          journeys.
        </p>

        <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {cities.map((c) => (
            <article
              key={c.id}
              className="group overflow-hidden rounded-2xl border border-border bg-card shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
            >
              <div className="relative aspect-4/3 overflow-hidden bg-muted">
                {c.image_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={c.image_url}
                    alt=""
                    className="size-full object-cover transition duration-500 group-hover:scale-105"
                  />
                ) : null}
              </div>
              <div className="space-y-2 p-4">
                <h3 className="text-lg font-semibold">{c.name}</h3>
                <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  {c.country}
                </p>
                <p className="line-clamp-2 text-sm text-muted-foreground">
                  {c.description ?? "Explore trips to this destination."}
                </p>
                {c.starting_price != null ? (
                  <p className="text-sm font-semibold text-primary">
                    From ${Number(c.starting_price).toFixed(0)}
                  </p>
                ) : null}
                <Link
                  href={`/journeys/search?to=${encodeURIComponent(c.name)}&from=Paris&departure=2026-09-01&passengers=1`}
                  className={cn(buttonVariants({ size: "sm" }), "mt-1")}
                >
                  Explore
                </Link>
              </div>
            </article>
          ))}
        </div>

        {cities.length === 0 ? (
          <p className="mt-8 text-sm text-muted-foreground">
            No destinations yet. Seed the catalog to populate this section.
          </p>
        ) : null}
      </div>
    </section>
  );
}
