"use client";

import { useMemo, useState, useTransition } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { CalendarDaysIcon, ListIcon } from "lucide-react";
import { ItineraryActivityBlock } from "@/components/trips/itinerary-activity-block";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";

export type ItineraryStop = {
  id: string;
  city_name: string;
  country: string;
  start_date: string;
  end_date: string;
  stop_order: number;
};

export type ItineraryActivity = {
  id: string;
  stop_id: string;
  activity_name: string;
  day_date: string;
  start_time: string | null;
  end_time: string | null;
  cost: string | number | null;
  custom_cost: string | number | null;
  is_done?: boolean;
  type?: string;
};

type Mode = "list" | "calendar";

function monthMatrix(year: number, month: number) {
  const first = new Date(Date.UTC(year, month, 1));
  const startPad = first.getUTCDay();
  const daysInMonth = new Date(Date.UTC(year, month + 1, 0)).getUTCDate();
  const cells: (number | null)[] = [];
  for (let i = 0; i < startPad; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);
  while (cells.length % 7 !== 0) cells.push(null);
  return cells;
}

export function ItineraryView({
  tripId,
  tripName,
  tripStart,
  tripEnd,
  stops,
  activities: initialActivities,
  initialMode = "list",
}: {
  tripId: string;
  tripName: string;
  tripStart: string;
  tripEnd: string;
  stops: ItineraryStop[];
  activities: ItineraryActivity[];
  initialMode?: Mode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [mode, setMode] = useState<Mode>(
    searchParams.get("mode") === "calendar" ? "calendar" : initialMode
  );
  const [activities, setActivities] = useState(initialActivities);
  const [selectedDay, setSelectedDay] = useState<string | null>(null);
  const [, startTransition] = useTransition();

  const stopById = useMemo(() => {
    const map = new Map<string, ItineraryStop>();
    for (const s of stops) map.set(s.id, s);
    return map;
  }, [stops]);

  const dayKeys = useMemo(() => {
    const set = new Set<string>();
    for (const a of activities) set.add(String(a.day_date).slice(0, 10));
    return [...set].sort();
  }, [activities]);

  const byDay = useMemo(() => {
    const map = new Map<string, ItineraryActivity[]>();
    for (const a of activities) {
      const key = String(a.day_date).slice(0, 10);
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(a);
    }
    for (const list of map.values()) {
      list.sort((a, b) =>
        String(a.start_time ?? "").localeCompare(String(b.start_time ?? ""))
      );
    }
    return map;
  }, [activities]);

  function switchMode(next: Mode) {
    setMode(next);
    const params = new URLSearchParams(searchParams.toString());
    if (next === "list") params.delete("mode");
    else params.set("mode", next);
    const q = params.toString();
    startTransition(() => {
      router.replace(q ? `${pathname}?${q}` : pathname, { scroll: false });
    });
  }

  async function patchActivity(
    id: string,
    patch: { is_done?: boolean; custom_cost?: number | null }
  ) {
    setActivities((prev) =>
      prev.map((a) => (a.id === id ? { ...a, ...patch } : a))
    );
    const res = await fetch(`/api/trips/${tripId}/activities/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(patch),
    });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      throw new Error(data.error ?? "Failed to update activity");
    }
    router.refresh();
  }

  const calAnchor = selectedDay || dayKeys[0] || tripStart;
  const anchorDate = new Date(calAnchor + "T12:00:00Z");
  const year = anchorDate.getUTCFullYear();
  const month = anchorDate.getUTCMonth();
  const cells = monthMatrix(year, month);
  const monthLabel = anchorDate.toLocaleString(undefined, {
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  });

  function shiftMonth(delta: number) {
    const d = new Date(Date.UTC(year, month + delta, 1));
    const y = d.getUTCFullYear();
    const m = String(d.getUTCMonth() + 1).padStart(2, "0");
    setSelectedDay(`${y}-${m}-01`);
  }

  const detailDay = selectedDay && byDay.has(selectedDay) ? selectedDay : null;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">{tripName}</h1>
          <p className="text-sm text-muted-foreground">
            Review your plan · {tripStart} – {tripEnd}
          </p>
        </div>
        <div
          className="inline-flex rounded-lg border border-border p-1"
          role="group"
          aria-label="View mode"
        >
          <Button
            type="button"
            size="sm"
            variant={mode === "list" ? "secondary" : "ghost"}
            onClick={() => switchMode("list")}
          >
            <ListIcon data-icon="inline-start" />
            List
          </Button>
          <Button
            type="button"
            size="sm"
            variant={mode === "calendar" ? "secondary" : "ghost"}
            onClick={() => switchMode("calendar")}
          >
            <CalendarDaysIcon data-icon="inline-start" />
            Calendar
          </Button>
        </div>
      </div>

      {mode === "list" ? (
        dayKeys.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            No scheduled activities yet. Add some in the builder.
          </p>
        ) : (
          <div className="space-y-8">
            {dayKeys.map((day, idx) => {
              const items = byDay.get(day) ?? [];
              return (
                <section key={day} className="space-y-3">
                  <div className="flex flex-wrap items-baseline justify-between gap-2">
                    <h2 className="text-lg font-semibold tracking-tight">
                      Day {idx + 1}
                      <span className="ml-2 text-sm font-normal text-muted-foreground">
                        {day}
                      </span>
                    </h2>
                    <Badge variant="outline">{items.length} activities</Badge>
                  </div>
                  <Separator />
                  <ul className="space-y-2">
                    {items.map((a) => {
                      const stop = stopById.get(a.stop_id);
                      return (
                        <li key={a.id}>
                          {stop ? (
                            <p className="mb-1 text-xs font-medium tracking-wide text-muted-foreground uppercase">
                              {stop.city_name}
                              {stop.country ? `, ${stop.country}` : ""}
                            </p>
                          ) : null}
                          <ItineraryActivityBlock
                            activity={a}
                            onToggleDone={(done) =>
                              patchActivity(a.id, { is_done: done })
                            }
                            onCostChange={(cost) =>
                              patchActivity(a.id, { custom_cost: cost })
                            }
                          />
                        </li>
                      );
                    })}
                  </ul>
                </section>
              );
            })}

            <section className="space-y-3 pt-2">
              <h2 className="text-base font-semibold">Stops overview</h2>
              <div className="flex flex-wrap gap-2">
                {stops.map((s) => (
                  <Badge key={s.id} variant="secondary">
                    {s.stop_order}. {s.city_name} · {s.start_date}–{s.end_date}
                  </Badge>
                ))}
              </div>
            </section>
          </div>
        )
      ) : (
        <div className="space-y-6">
          <div className="flex items-center justify-between gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => shiftMonth(-1)}
            >
              Previous
            </Button>
            <h2 className="text-base font-semibold">{monthLabel}</h2>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => shiftMonth(1)}
            >
              Next
            </Button>
          </div>

          <div className="grid grid-cols-7 gap-1 text-center text-xs text-muted-foreground">
            {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d) => (
              <div key={d} className="py-1 font-medium">
                {d}
              </div>
            ))}
            {cells.map((dayNum, i) => {
              if (dayNum == null) {
                return <div key={`e-${i}`} className="aspect-square" />;
              }
              const iso = `${year}-${String(month + 1).padStart(2, "0")}-${String(dayNum).padStart(2, "0")}`;
              const has = byDay.has(iso);
              const inTrip = iso >= tripStart && iso <= tripEnd;
              const selected = selectedDay === iso;
              return (
                <button
                  key={iso}
                  type="button"
                  disabled={!has && !inTrip}
                  onClick={() => setSelectedDay(iso)}
                  className={cn(
                    "aspect-square rounded-md border text-sm transition-colors",
                    has
                      ? "border-primary bg-primary/10 font-semibold text-foreground"
                      : "border-transparent",
                    inTrip && !has && "bg-muted/40 text-muted-foreground",
                    selected && "ring-2 ring-primary",
                    !inTrip && !has && "opacity-40"
                  )}
                >
                  {dayNum}
                </button>
              );
            })}
          </div>

          <div className="space-y-3 rounded-lg border border-border p-4">
            <h3 className="text-sm font-semibold">
              {detailDay
                ? `Activities on ${detailDay}`
                : selectedDay
                  ? `No activities on ${selectedDay}`
                  : "Select a highlighted day"}
            </h3>
            {detailDay ? (
              <ul className="space-y-2">
                {(byDay.get(detailDay) ?? []).map((a) => {
                  const stop = stopById.get(a.stop_id);
                  return (
                    <li key={a.id} className="space-y-1">
                      {stop ? (
                        <p className="text-xs font-medium text-muted-foreground uppercase">
                          {stop.city_name}
                        </p>
                      ) : null}
                      <ItineraryActivityBlock
                        activity={a}
                        onToggleDone={(done) =>
                          patchActivity(a.id, { is_done: done })
                        }
                        onCostChange={(cost) =>
                          patchActivity(a.id, { custom_cost: cost })
                        }
                      />
                    </li>
                  );
                })}
              </ul>
            ) : (
              <p className="text-sm text-muted-foreground">
                Days with plans are highlighted. Click one to expand.
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
