"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  TripListCard,
  type TripListItem,
  type TripStatus,
} from "@/components/trips/trip-list-card";
import { buttonVariants } from "@/components/ui/button";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyTitle,
} from "@/components/ui/empty";
import { cn } from "@/lib/utils";

const FILTERS: { id: "all" | TripStatus; label: string }[] = [
  { id: "all", label: "All" },
  { id: "ongoing", label: "Ongoing" },
  { id: "upcoming", label: "Upcoming" },
  { id: "completed", label: "Completed" },
];

export function TripsBoard({ trips }: { trips: TripListItem[] }) {
  const [filter, setFilter] = useState<"all" | TripStatus>("all");

  const visible = useMemo(() => {
    const list =
      filter === "all" ? trips : trips.filter((t) => t.status === filter);
    return [...list].sort((a, b) =>
      a.start_date.localeCompare(b.start_date)
    );
  }, [trips, filter]);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">My Trips</h1>
          <p className="text-sm text-muted-foreground">
            Create a trip → add cities in Builder → track budget &amp; calendar
          </p>
        </div>
        <Link href="/trips/new" className={cn(buttonVariants())}>
          Plan new trip
        </Link>
      </div>

      <div
        className="flex flex-wrap gap-1 rounded-lg border border-border p-1"
        role="tablist"
        aria-label="Trip status filter"
      >
        {FILTERS.map((f) => {
          const count =
            f.id === "all"
              ? trips.length
              : trips.filter((t) => t.status === f.id).length;
          return (
            <button
              key={f.id}
              type="button"
              role="tab"
              aria-selected={filter === f.id}
              onClick={() => setFilter(f.id)}
              className={cn(
                "rounded-md px-3 py-1.5 text-sm transition-colors",
                filter === f.id
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              )}
            >
              {f.label}
              <span className="ml-1.5 tabular-nums opacity-70">{count}</span>
            </button>
          );
        })}
      </div>

      {trips.length === 0 ? (
        <Empty className="border border-dashed">
          <EmptyHeader>
            <EmptyTitle>No trips yet</EmptyTitle>
            <EmptyDescription>
              Plan your first multi-city adventure with the booking stepper.
            </EmptyDescription>
          </EmptyHeader>
          <Link href="/trips/new" className={cn(buttonVariants())}>
            Plan your first trip
          </Link>
        </Empty>
      ) : visible.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          No trips in this filter.
        </p>
      ) : (
        <div className="grid gap-4">
          {visible.map((t) => (
            <TripListCard key={t.id} trip={t} />
          ))}
        </div>
      )}
    </div>
  );
}
