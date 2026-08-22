import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type HeroBannerProps = {
  url: string | null;
  alt: string;
  title: string;
  subtitle: string;
  userDisplayName?: string;
  tripCount?: number;
};

export function HeroBanner({
  url,
  alt,
  title,
  subtitle,
  userDisplayName,
  tripCount = 0,
}: HeroBannerProps) {
  return (
    <section className="relative overflow-hidden border-b border-border">
      <div className="absolute inset-0 bg-muted">
        {url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={url} alt={alt} className="size-full object-cover" />
        ) : null}
        <div className="absolute inset-0 bg-black/45" />
        <div className="absolute inset-x-0 bottom-0 h-1/2 bg-linear-to-t from-background to-transparent" />
      </div>

      <div className="relative mx-auto flex min-h-[300px] w-full max-w-6xl flex-col justify-end px-4 py-10 sm:min-h-[360px] sm:px-6">
        {userDisplayName ? (
          <p className="text-sm font-medium text-foreground/90">
            Welcome back, {userDisplayName}
            {tripCount > 0 ? ` · ${tripCount} active trip${tripCount === 1 ? "" : "s"}` : ""}
          </p>
        ) : null}
        <h1 className="mt-2 max-w-2xl font-display text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl">
          {title}
        </h1>
        <p className="mt-3 max-w-xl text-sm leading-relaxed text-muted-foreground sm:text-base">
          {subtitle}
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          <Link
            href="/trips/new"
            className={cn(buttonVariants({ size: "lg" }), "font-semibold")}
          >
            Plan New Trip
          </Link>
          <Link
            href="/journeys/search"
            className={cn(
              buttonVariants({ variant: "outline", size: "lg" }),
              "font-medium"
            )}
          >
            Search Journeys
          </Link>
          <Link
            href="/search?type=city"
            className={cn(
              buttonVariants({ variant: "ghost", size: "lg" }),
              "font-medium"
            )}
          >
            Browse cities
          </Link>
        </div>
      </div>
    </section>
  );
}
