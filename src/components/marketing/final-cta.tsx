import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function FinalCta() {
  return (
    <section className="relative overflow-hidden py-16 sm:py-20">
      <div className="absolute inset-0">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/marketing/mountains.jpg"
          alt=""
          className="size-full object-cover"
        />
        <div className="absolute inset-0 bg-primary/85" />
      </div>
      <div className="relative mx-auto max-w-6xl px-4 text-center text-primary-foreground sm:px-6">
        <h2 className="font-display text-3xl font-bold tracking-tight sm:text-4xl">
          Ready for Your Next Adventure?
        </h2>
        <p className="mx-auto mt-3 max-w-xl text-primary-foreground/85">
          Find your perfect journey and book your next trip in just a few
          clicks.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Link
            href="#destinations"
            className={cn(
              buttonVariants({ size: "lg" }),
              "bg-white font-semibold text-primary hover:bg-white/90"
            )}
          >
            Explore Trips
          </Link>
          <a
            href="#search"
            className={cn(
              buttonVariants({ variant: "outline", size: "lg" }),
              "border-white/50 bg-transparent text-white hover:bg-white/10 hover:text-white"
            )}
          >
            Search Journeys
          </a>
        </div>
      </div>
    </section>
  );
}
