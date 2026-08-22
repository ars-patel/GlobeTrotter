"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ChevronLeftIcon, ChevronRightIcon, MapPinIcon } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyTitle,
} from "@/components/ui/empty";
import { cn } from "@/lib/utils";

export type ScheduleTrip = {
  id: string;
  name: string;
  start_date: string;
  end_date: string;
  cover_photo: string | null;
};

export type ScheduleActivity = {
  id: string;
  trip_id: string;
  trip_name: string;
  day_date: string;
  title: string;
  start_time: string | null;
  city_name: string | null;
  cost: number | null;
};

export type ScheduleDayMeta = {
  date: string;
  tripIds: string[];
  activityCount: number;
  labels: string[];
};

const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"] as const;

function monthLabel(monthStr: string) {
  const [y, m] = monthStr.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, 1)).toLocaleString(undefined, {
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  });
}

function adjacentMonth(monthStr: string, delta: number) {
  const [y, m] = monthStr.split("-").map(Number);
  const d = new Date(Date.UTC(y, m - 1 + delta, 1));
  return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, "0")}`;
}

function buildCells(monthStr: string) {
  const [y, m] = monthStr.split("-").map(Number);
  const firstDow = new Date(Date.UTC(y, m - 1, 1)).getUTCDay();
  const daysInMonth = new Date(Date.UTC(y, m, 0)).getUTCDate();
  const cells: Array<number | null> = [
    ...Array.from({ length: firstDow }, () => null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];
  while (cells.length % 7 !== 0) cells.push(null);
  return cells;
}

export function ScheduleCalendar({
  month,
  trips,
  activities,
  days,
}: {
  month: string;
  trips: ScheduleTrip[];
  activities: ScheduleActivity[];
  days: Record<string, ScheduleDayMeta>;
}) {
  const today = useMemo(() => new Date().toISOString().slice(0, 10), []);
  const cells = useMemo(() => buildCells(month), [month]);
  const highlightedDates = useMemo(() => new Set(Object.keys(days)), [days]);

  const defaultSelected =
    [...highlightedDates].sort().find((d) => d >= today) ??
    [...highlightedDates].sort()[0] ??
    null;

  const [selected, setSelected] = useState<string | null>(defaultSelected);

  const dayActivities = useMemo(
    () =>
      selected
        ? activities.filter((a) => a.day_date === selected)
        : [],
    [activities, selected]
  );

  const dayTrips = useMemo(() => {
    if (!selected) return [];
    const meta = days[selected];
    if (!meta) return [];
    return trips.filter((t) => meta.tripIds.includes(t.id));
  }, [days, selected, trips]);

  const prev = adjacentMonth(month, -1);
  const next = adjacentMonth(month, 1);

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">
            Timeline
          </p>
          <h1 className="mt-1 font-display text-3xl font-bold tracking-tight sm:text-4xl">
            Schedule
          </h1>
          <p className="mt-2 max-w-xl text-sm text-muted-foreground">
            Month view of your trips and daily activities. Click a highlighted
            day to expand the plan, reorder on each trip’s calendar.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Link
            href={`/schedule?month=${prev}`}
            className={cn(buttonVariants({ variant: "outline", size: "icon-sm" }))}
            aria-label="Previous month"
          >
            <ChevronLeftIcon className="size-4" />
          </Link>
          <span className="min-w-36 text-center text-sm font-semibold">
            {monthLabel(month)}
          </span>
          <Link
            href={`/schedule?month=${next}`}
            className={cn(buttonVariants({ variant: "outline", size: "icon-sm" }))}
            aria-label="Next month"
          >
            <ChevronRightIcon className="size-4" />
          </Link>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
        <section className="rounded-2xl border border-border bg-card p-3 shadow-sm sm:p-4">
          <div className="grid grid-cols-7 gap-1 text-center text-xs font-medium text-muted-foreground">
            {WEEKDAYS.map((d) => (
              <div key={d} className="py-2">
                {d}
              </div>
            ))}
          </div>
          <div className="grid grid-cols-7 gap-1">
            {cells.map((day, i) => {
              if (day == null) {
                return <div key={`e-${i}`} className="aspect-square" />;
              }
              const key = `${month}-${String(day).padStart(2, "0")}`;
              const meta = days[key];
              const on = Boolean(meta);
              const isSelected = selected === key;
              const isToday = key === today;

              return (
                <button
                  key={key}
                  type="button"
                  onClick={() => setSelected(key)}
                  className={cn(
                    "relative flex aspect-square flex-col items-center justify-center rounded-xl border text-sm transition",
                    on
                      ? "border-primary bg-primary text-primary-foreground hover:bg-primary/90"
                      : "border-transparent hover:border-border hover:bg-muted/60",
                    isSelected && on && "ring-2 ring-primary ring-offset-2",
                    isSelected && !on && "border-border bg-muted",
                    isToday && !on && "border-primary/40"
                  )}
                >
                  <span className="font-semibold">{day}</span>
                  {meta && meta.activityCount > 0 ? (
                    <span
                      className={cn(
                        "mt-0.5 text-[10px] leading-none",
                        on ? "text-primary-foreground/80" : "text-muted-foreground"
                      )}
                    >
                      {meta.activityCount} act
                    </span>
                  ) : null}
                </button>
              );
            })}
          </div>
          <p className="mt-3 text-xs text-muted-foreground">
            Highlighted days overlap a trip date range or have scheduled
            activities.
          </p>
        </section>

        <section className="rounded-2xl border border-border bg-card p-4 shadow-sm sm:p-5">
          <h2 className="font-display text-xl font-bold tracking-tight">
            {selected
              ? new Date(`${selected}T12:00:00Z`).toLocaleDateString(undefined, {
                  weekday: "long",
                  month: "long",
                  day: "numeric",
                  timeZone: "UTC",
                })
              : "Select a day"}
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Expandable day view of trips and activities from your database.
          </p>

          {!selected ? (
            <Empty className="mt-6 border border-dashed">
              <EmptyHeader>
                <EmptyTitle>Pick a day</EmptyTitle>
                <EmptyDescription>
                  Choose a highlighted date to see what’s planned.
                </EmptyDescription>
              </EmptyHeader>
            </Empty>
          ) : dayTrips.length === 0 && dayActivities.length === 0 ? (
            <Empty className="mt-6 border border-dashed">
              <EmptyHeader>
                <EmptyTitle>Nothing planned</EmptyTitle>
                <EmptyDescription>
                  No trips or activities on this day. Plan a trip or add
                  activities from Search.
                </EmptyDescription>
              </EmptyHeader>
              <Link
                href="/trips/new"
                className={cn(buttonVariants({ size: "sm" }), "mt-3")}
              >
                Plan New Trip
              </Link>
            </Empty>
          ) : (
            <div className="mt-5 space-y-5">
              {dayTrips.length > 0 ? (
                <div className="space-y-2">
                  <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    Trips
                  </p>
                  {dayTrips.map((t) => (
                    <div
                      key={t.id}
                      className="rounded-xl border border-border p-3"
                    >
                      <p className="font-semibold">{t.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {t.start_date} – {t.end_date}
                      </p>
                      <div className="mt-2 flex flex-wrap gap-2">
                        <Link
                          href={`/trips/${t.id}/calendar`}
                          className={cn(buttonVariants({ size: "sm" }))}
                        >
                          Open timeline
                        </Link>
                        <Link
                          href={`/trips/${t.id}/itinerary`}
                          className={cn(
                            buttonVariants({ variant: "outline", size: "sm" })
                          )}
                        >
                          Itinerary
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              ) : null}

              {dayActivities.length > 0 ? (
                <div className="space-y-2">
                  <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    Activities
                  </p>
                  <ul className="space-y-2">
                    {dayActivities.map((a) => (
                      <li
                        key={a.id}
                        className="rounded-xl border border-border p-3"
                      >
                        <div className="flex flex-wrap items-start justify-between gap-2">
                          <div>
                            <p className="font-medium">{a.title}</p>
                            <p className="mt-0.5 flex items-center gap-1 text-xs text-muted-foreground">
                              {a.city_name ? (
                                <>
                                  <MapPinIcon className="size-3" />
                                  {a.city_name}
                                </>
                              ) : null}
                              {a.start_time ? ` · ${a.start_time}` : null}
                              {` · ${a.trip_name}`}
                            </p>
                          </div>
                          {a.cost != null ? (
                            <Badge variant="outline">
                              ${Number(a.cost).toFixed(0)}
                            </Badge>
                          ) : null}
                        </div>
                        <Link
                          href={`/trips/${a.trip_id}/calendar`}
                          className={cn(
                            buttonVariants({ variant: "ghost", size: "sm" }),
                            "mt-2 px-0"
                          )}
                        >
                          Edit on trip calendar →
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">
                  Trip day with no activities yet — open the timeline to add or
                  reorder.
                </p>
              )}
            </div>
          )}
        </section>
      </div>

      <section className="space-y-3">
        <div className="flex items-end justify-between gap-3">
          <div>
            <h2 className="font-display text-xl font-bold tracking-tight">
              Trips this month
            </h2>
            <p className="text-sm text-muted-foreground">
              Overlapping itineraries for {monthLabel(month)}.
            </p>
          </div>
          <Link
            href="/trips"
            className={cn(buttonVariants({ variant: "outline", size: "sm" }))}
          >
            All trips
          </Link>
        </div>

        {trips.length === 0 ? (
          <Empty className="border border-dashed">
            <EmptyHeader>
              <EmptyTitle>No trips this month</EmptyTitle>
              <EmptyDescription>
                Create a trip with dates in this month to see calendar
                highlights.
              </EmptyDescription>
            </EmptyHeader>
            <Link
              href="/trips/new"
              className={cn(buttonVariants({ size: "sm" }), "mt-3")}
            >
              Plan New Trip
            </Link>
          </Empty>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2">
            {trips.map((t) => (
              <article
                key={t.id}
                className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm"
              >
                <div className="aspect-16/7 bg-muted">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={t.cover_photo || "/marketing/coast.jpg"}
                    alt=""
                    className="size-full object-cover"
                  />
                </div>
                <div className="p-4">
                  <h3 className="font-semibold">{t.name}</h3>
                  <p className="text-sm text-muted-foreground">
                    {t.start_date} – {t.end_date}
                  </p>
                  <Link
                    href={`/trips/${t.id}/calendar`}
                    className={cn(buttonVariants({ size: "sm" }), "mt-3")}
                  >
                    Open calendar timeline
                  </Link>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
