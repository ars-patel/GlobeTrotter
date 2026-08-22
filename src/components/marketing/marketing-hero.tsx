import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function MarketingHero({
  imageUrl,
  imageAlt,
}: {
  imageUrl: string;
  imageAlt: string;
}) {
  return (
    <section className="relative min-h-[88vh] w-full overflow-hidden">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={imageUrl}
        alt={imageAlt}
        className="absolute inset-0 size-full object-cover"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/35 to-black/25" />
      <div className="relative mx-auto flex min-h-[88vh] w-full max-w-6xl flex-col justify-end px-6 pb-20 pt-28">
        <p className="mb-3 text-4xl font-semibold tracking-tight text-white sm:text-5xl md:text-6xl">
          GlobeTrotter
        </p>
        <h1 className="max-w-2xl text-2xl font-medium leading-snug text-white/95 sm:text-3xl">
          Plan multi-city trips with clarity
        </h1>
        <p className="mt-3 max-w-xl text-base text-white/80 sm:text-lg">
          Build itineraries, stay on budget, and share journeys — from first stop
          to final day.
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          <Link
            href="/signup"
            className={cn(
              buttonVariants({ size: "lg" }),
              "bg-white text-primary hover:bg-white/90"
            )}
          >
            Start planning
          </Link>
          <a
            href="#destinations"
            className={cn(
              buttonVariants({ variant: "outline", size: "lg" }),
              "border-white/40 bg-white/10 text-white backdrop-blur hover:bg-white/20 hover:text-white"
            )}
          >
            Explore destinations
          </a>
        </div>
      </div>
    </section>
  );
}
