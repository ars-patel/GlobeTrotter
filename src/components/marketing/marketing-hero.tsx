"use client";

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
    <section className="relative w-full">
      <div className="relative min-h-[70vh] w-full overflow-hidden sm:min-h-[78vh]">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={imageUrl}
          alt={imageAlt}
          className="absolute inset-0 size-full object-cover"
        />
        <div className="absolute inset-0 bg-black/50" />
        <div className="relative mx-auto flex min-h-[70vh] w-full max-w-6xl flex-col justify-center px-4 py-20 sm:min-h-[78vh] sm:px-6">
          <p className="font-display text-sm font-semibold uppercase tracking-[0.2em] text-white/80">
            GlobeTrotter
          </p>
          <h1 className="mt-3 max-w-2xl font-display text-4xl font-bold tracking-tight text-white sm:text-5xl md:text-6xl">
            Plan multi-city trips with clarity
          </h1>
          <p className="mt-4 max-w-xl text-base leading-relaxed text-white/85 sm:text-lg">
            Build itineraries, set budgets, and share your plans — travel
            planning made personal and organized.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              href="/signup?next=/trips/new"
              className={cn(
                buttonVariants({ size: "lg" }),
                "bg-white font-semibold text-primary hover:bg-white/90"
              )}
            >
              Plan New Trip
            </Link>
            <Link
              href="#destinations"
              className={cn(
                buttonVariants({ variant: "outline", size: "lg" }),
                "border-white/50 bg-transparent text-white hover:bg-white/10 hover:text-white"
              )}
            >
              Explore destinations
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
