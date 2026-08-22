"use client";

import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { BookingSearchCard, type DestinationOption } from "@/components/marketing/booking-search-card";

export function MarketingHero({
  imageUrl,
  imageAlt,
  destinations,
}: {
  imageUrl: string;
  imageAlt: string;
  destinations: DestinationOption[];
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
          <h1 className="max-w-2xl font-display text-4xl font-bold tracking-tight text-white sm:text-5xl md:text-6xl">
            Your Journey Starts Here
          </h1>
          <p className="mt-4 max-w-xl text-base leading-relaxed text-white/85 sm:text-lg">
            Discover destinations, compare available journeys, and book your
            next trip with confidence.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <a
              href="#search"
              className={cn(
                buttonVariants({ size: "lg" }),
                "bg-white font-semibold text-primary hover:bg-white/90"
              )}
            >
              Search Trips
            </a>
            <Link
              href="#destinations"
              className={cn(
                buttonVariants({ variant: "outline", size: "lg" }),
                "border-white/50 bg-transparent text-white hover:bg-white/10 hover:text-white"
              )}
            >
              Explore Journeys
            </Link>
          </div>
        </div>
      </div>

      <div
        id="search"
        className="relative z-10 mx-auto -mt-16 w-full max-w-6xl px-4 sm:-mt-20 sm:px-6"
      >
        <BookingSearchCard destinations={destinations} />
      </div>
    </section>
  );
}
