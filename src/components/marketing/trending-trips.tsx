import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export type MarketingTrip = {
  id: string;
  name: string;
  description: string | null;
  cover_photo: string | null;
  start_date: string;
  end_date: string;
  start_point: string | null;
  end_point: string | null;
  share_slug: string | null;
};

export function TrendingTrips({ trips }: { trips: MarketingTrip[] }) {
  return (
    <section id="trending" className="scroll-mt-20 py-16 sm:py-20">
      <div className="mx-auto max-w-6xl px-6">
        <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">
          Trending trips
        </h2>
        <p className="mt-2 max-w-2xl text-muted-foreground">
          Public and featured itineraries for inspiration — copy them after you
          sign up.
        </p>
        <div className="mt-10 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {trips.map((t) => (
            <article
              key={t.id}
              className="overflow-hidden rounded-2xl border border-border bg-card"
            >
              <div className="relative aspect-[16/10] bg-muted">
                {t.cover_photo ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={t.cover_photo}
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
              <div className="space-y-3 p-4">
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="text-lg font-semibold">{t.name}</h3>
                  <Badge variant="secondary">Featured</Badge>
                </div>
                <p className="text-sm text-muted-foreground">
                  {t.start_date} – {t.end_date}
                  {t.start_point || t.end_point
                    ? ` · ${[t.start_point, t.end_point].filter(Boolean).join(" → ")}`
                    : ""}
                </p>
                {t.description ? (
                  <p className="line-clamp-2 text-sm text-muted-foreground">
                    {t.description}
                  </p>
                ) : null}
                {t.share_slug ? (
                  <Link
                    href={`/share/${t.share_slug}`}
                    className={cn(buttonVariants({ size: "sm" }))}
                  >
                    View itinerary
                  </Link>
                ) : (
                  <Link
                    href="/signup"
                    className={cn(buttonVariants({ size: "sm" }))}
                  >
                    Sign up to explore
                  </Link>
                )}
              </div>
            </article>
          ))}
        </div>
        {trips.length === 0 ? (
          <p className="mt-6 text-sm text-muted-foreground">
            No public trips yet. Be the first to share one after signup.
          </p>
        ) : null}
      </div>
    </section>
  );
}
