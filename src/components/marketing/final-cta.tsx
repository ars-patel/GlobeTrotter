"use client";

import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useAuthModal } from "@/components/auth/auth-modal-context";

export function FinalCta() {
  const { openAuth } = useAuthModal();

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
          Ready to plan your next trip?
        </h2>
        <p className="mx-auto mt-3 max-w-xl text-primary-foreground/85">
          Start a multi-city itinerary, shape the days, and keep your budget in
          view from the first stop.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <button
            type="button"
            onClick={() => openAuth("signup", "/trips/new")}
            className={cn(
              buttonVariants({ size: "lg" }),
              "bg-white font-semibold text-primary hover:bg-white/90"
            )}
          >
            Plan New Trip
          </button>
          <Link
            href="#how-it-works"
            className={cn(
              buttonVariants({ variant: "outline", size: "lg" }),
              "border-white/50 bg-transparent text-white hover:bg-white/10 hover:text-white"
            )}
          >
            See how it works
          </Link>
        </div>
      </div>
    </section>
  );
}
