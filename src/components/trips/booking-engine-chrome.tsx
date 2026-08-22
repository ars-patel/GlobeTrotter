"use client";

import {
  useEffect,
  useState,
  type ReactNode,
} from "react";
import Link from "next/link";
import { Globe2Icon } from "lucide-react";
import {
  BookingStepper,
  type BookingStep,
} from "@/components/trips/booking-stepper";
import { cn } from "@/lib/utils";

/** Show steps in the navbar as soon as the user scrolls a little */
const SCROLL_DOCK_PX = 12;

function getScrollY() {
  return (
    window.scrollY ||
    document.documentElement.scrollTop ||
    document.body.scrollTop ||
    0
  );
}

export function BookingEngineChrome({
  steps,
  currentStep,
  maxReachedStep,
  onStepSelect,
  title,
  subtitle,
  heroImage,
  summary,
  children,
}: {
  steps: BookingStep[];
  currentStep: number;
  maxReachedStep: number;
  onStepSelect?: (index: number) => void;
  title: string;
  subtitle: string;
  heroImage: string;
  summary: ReactNode;
  children: ReactNode;
}) {
  const [docked, setDocked] = useState(false);

  useEffect(() => {
    const update = () => {
      setDocked(getScrollY() > SCROLL_DOCK_PX);
    };

    update();
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    document.addEventListener("scroll", update, { passive: true, capture: true });

    return () => {
      window.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
      document.removeEventListener("scroll", update, true);
    };
  }, []);

  return (
    <div className="min-h-full bg-background">
      <header className="sticky top-0 z-50 bg-primary text-primary-foreground shadow-md">
        <div
          className={cn(
            "relative mx-auto flex w-full max-w-6xl items-center gap-3 px-3 transition-all duration-200 sm:px-6",
            docked ? "min-h-[4.25rem] py-2" : "h-14"
          )}
        >
          <Link
            href="/discover"
            className="relative z-10 flex shrink-0 items-center gap-2"
          >
            <span className="flex size-8 items-center justify-center rounded-full bg-primary-foreground/15">
              <Globe2Icon className="size-4" />
            </span>
            <span className="font-display text-lg font-bold tracking-tight">
              GlobeTrotter
            </span>
          </Link>

          {docked ? (
            <>
              <div className="pointer-events-none absolute inset-x-0 top-1/2 z-0 flex -translate-y-1/2 justify-center px-24 sm:px-36 lg:px-44">
                <div className="pointer-events-auto w-full max-w-md md:max-w-lg lg:max-w-xl">
                  <BookingStepper
                    steps={steps}
                    currentStep={currentStep}
                    maxReachedStep={maxReachedStep}
                    onStepSelect={onStepSelect}
                    variant="navbar"
                  />
                </div>
              </div>
              <div className="relative z-10 ml-auto hidden min-w-0 max-w-44 shrink-0 text-right lg:block">
                <p className="truncate text-xs font-medium text-primary-foreground/95">
                  {title}
                </p>
                <p className="truncate text-[11px] text-primary-foreground/70">
                  {subtitle}
                </p>
              </div>
              {/* spacer so header height stays balanced when title is hidden */}
              <div className="ml-auto size-8 shrink-0 lg:hidden" aria-hidden />
            </>
          ) : (
            <p className="ml-auto text-sm font-medium text-primary-foreground/90">
              Booking
            </p>
          )}
        </div>
      </header>

      <section className="relative">
        <div className="relative h-[min(48vh,420px)] min-h-[280px] w-full overflow-hidden">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={heroImage}
            alt=""
            className="absolute inset-0 size-full object-cover"
          />
          <div className="absolute inset-0 bg-black/45" />
          <div className="relative mx-auto flex h-full max-w-6xl flex-col items-center justify-center px-4 pb-16 text-center text-white sm:px-6 sm:pb-20">
            <h1 className="max-w-3xl font-display text-3xl font-bold tracking-tight text-balance sm:text-4xl md:text-5xl">
              {title}
            </h1>
            <p className="mt-3 text-base text-white/85 sm:text-lg">{subtitle}</p>
          </div>
        </div>

        <div
          className={cn(
            "relative z-10 mx-auto w-full max-w-4xl px-4 transition-[opacity,margin,height] duration-200 sm:px-6",
            docked
              ? "pointer-events-none -mt-4 h-0 overflow-hidden opacity-0"
              : "-mt-10 sm:-mt-12"
          )}
          aria-hidden={docked}
        >
          <div className="rounded-2xl border border-border bg-background px-4 py-5 shadow-xl sm:px-8 sm:py-6">
            <BookingStepper
              steps={steps}
              currentStep={currentStep}
              maxReachedStep={maxReachedStep}
              onStepSelect={onStepSelect}
              variant="overlap"
            />
          </div>
        </div>
      </section>

      <div
        className={cn(
          "mx-auto grid w-full max-w-6xl px-4 pb-16 sm:px-6",
          docked ? "gap-8 pt-10 sm:gap-10 sm:pt-12" : "gap-8 pt-8 sm:pt-10"
        )}
      >
        <div className="grid gap-8 sm:gap-10 lg:grid-cols-[minmax(0,1.55fr)_minmax(280px,0.9fr)] lg:items-start lg:gap-12">
          <div className="min-w-0">{children}</div>
          <aside className="lg:sticky lg:top-28">{summary}</aside>
        </div>
      </div>
    </div>
  );
}
