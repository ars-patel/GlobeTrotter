import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type HeroBannerProps = {
  url: string | null;
  alt: string;
  title: string;
  subtitle: string;
  userDisplayName?: string;
};

export function HeroBanner({
  url,
  alt,
  title,
  subtitle,
  userDisplayName,
}: HeroBannerProps) {
  return (
    <section className="relative overflow-hidden border-b border-border">
      <div className="absolute inset-0 bg-muted">
        {url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={url}
            alt={alt}
            className="h-full w-full object-cover"
          />
        ) : null}
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/70 to-background/20" />
      </div>

      <div className="relative mx-auto flex min-h-[280px] w-full max-w-6xl flex-col justify-end px-6 py-10 sm:min-h-[340px]">
        {userDisplayName ? (
          <p className="text-sm text-muted-foreground">
            Welcome back, {userDisplayName}
          </p>
        ) : null}
        <h1 className="mt-2 max-w-2xl text-3xl font-semibold tracking-tight sm:text-4xl">
          {title}
        </h1>
        <p className="mt-3 max-w-xl text-sm leading-relaxed text-muted-foreground sm:text-base">
          {subtitle}
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          <Link href="/trips/new" className={cn(buttonVariants())}>
            Plan New Trip
          </Link>
          <Link
            href="/search"
            className={cn(buttonVariants({ variant: "outline" }))}
          >
            Explore destinations
          </Link>
        </div>
      </div>
    </section>
  );
}
