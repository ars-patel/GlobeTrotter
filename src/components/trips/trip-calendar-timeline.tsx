"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { QuickEditActivitySheet } from "@/components/trips/quick-edit-activity-sheet";
import { TimelineActivityRow } from "@/components/trips/timeline-activity-row";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export type TimelineStop = {
  id: string;
  city_name: string;
  country: string;
  start_date: string;
  end_date: string;
  stop_order: number;
};

export type TimelineActivity = {
  id: string;
  stop_id: string;
  activity_name: string;
  day_date: string;
  start_time: string | null;
  end_time: string | null;
  act_order: number;
  notes: string | null;
  cost: string | number | null;
  custom_cost: string | number | null;
  is_done?: boolean;
  type?: string;
};

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

function sortDayList(list: TimelineActivity[]) {
  return [...list].sort(
    (a, b) =>
      a.act_order - b.act_order ||
      String(a.start_time ?? "").localeCompare(String(b.start_time ?? ""))
  );
}

export function TripCalendarTimeline({
  tripId,
  tripName,
  tripStart,
  tripEnd,
  stops,
  activities: initialActivities,
}: {
  tripId: string;
  tripName: string;
  tripStart: string;
  tripEnd: string;
  stops: TimelineStop[];
  activities: TimelineActivity[];
}) {
  const router = useRouter();
  const [activities, setActivities] = useState(initialActivities);
  const [expanded, setExpanded] = useState<Set<string>>(() => {
    const first = [...new Set(initialActivities.map((a) => a.day_date))].sort();
    return new Set(first.slice(0, 1));
  });
  const [selectedDay, setSelectedDay] = useState<string | null>(
    [...new Set(initialActivities.map((a) => a.day_date))].sort()[0] ?? null
  );
  const [calCursor, setCalCursor] = useState(() => {
    const anchor =
      [...new Set(initialActivities.map((a) => a.day_date))].sort()[0] ||
      tripStart;
    return anchor.slice(0, 7);
  });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dragId, setDragId] = useState<string | null>(null);
  const [editId, setEditId] = useState<string | null>(null);

  const stopById = useMemo(() => {
    const map = new Map<string, TimelineStop>();
    for (const s of stops) map.set(s.id, s);
    return map;
  }, [stops]);

  const dayKeys = useMemo(() => {
    const set = new Set<string>();
    for (const a of activities) set.add(a.day_date);
    // Include empty trip days so users can expand the journey window
    const startMs = Date.parse(`${tripStart}T12:00:00Z`);
    const endMs = Date.parse(`${tripEnd}T12:00:00Z`);
    for (let t = startMs; t <= endMs; t += 86400000) {
      set.add(new Date(t).toISOString().slice(0, 10));
    }
    return [...set].sort();
  }, [activities, tripStart, tripEnd]);

  const byDay = useMemo(() => {
    const map = new Map<string, TimelineActivity[]>();
    for (const a of activities) {
      if (!map.has(a.day_date)) map.set(a.day_date, []);
      map.get(a.day_date)!.push(a);
    }
    for (const [day, list] of map) {
      map.set(day, sortDayList(list));
    }
    return map;
  }, [activities]);

  const [cy, cm] = calCursor.split("-").map(Number);
  const year = cy;
  const month = cm - 1;
  const cells = monthMatrix(year, month);
  const monthLabel = new Date(Date.UTC(year, month, 1)).toLocaleString(
    undefined,
    { month: "long", year: "numeric", timeZone: "UTC" }
  );

  function shiftMonth(delta: number) {
    const d = new Date(Date.UTC(year, month + delta, 1));
    setCalCursor(
      `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, "0")}`
    );
  }

  function toggleDay(day: string) {
    setSelectedDay(day);
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(day)) next.delete(day);
      else next.add(day);
      return next;
    });
  }

  function selectCalendarDay(day: string) {
    setSelectedDay(day);
    setExpanded((prev) => new Set(prev).add(day));
  }

  async function persistOrder(day: string, ordered: TimelineActivity[]) {
    setBusy(true);
    setError(null);
    const previous = activities;
    setActivities((prev) => {
      const others = prev.filter((a) => a.day_date !== day);
      return [
        ...others,
        ...ordered.map((a, i) => ({ ...a, act_order: i })),
      ];
    });
    try {
      const res = await fetch(`/api/trips/${tripId}/activities/reorder`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          day_date: day,
          activity_ids: ordered.map((a) => a.id),
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Failed to reorder");
      router.refresh();
    } catch (err) {
      setActivities(previous);
      setError(err instanceof Error ? err.message : "Failed to reorder");
    } finally {
      setBusy(false);
      setDragId(null);
    }
  }

  function moveActivity(day: string, index: number, direction: -1 | 1) {
    const list = sortDayList(byDay.get(day) ?? []);
    const target = index + direction;
    if (target < 0 || target >= list.length) return;
    const next = [...list];
    const [item] = next.splice(index, 1);
    next.splice(target, 0, item);
    void persistOrder(day, next);
  }

  function dropOn(day: string, targetId: string) {
    if (!dragId || dragId === targetId) {
      setDragId(null);
      return;
    }
    const list = sortDayList(byDay.get(day) ?? []);
    const from = list.findIndex((a) => a.id === dragId);
    const to = list.findIndex((a) => a.id === targetId);
    if (from < 0 || to < 0) {
      setDragId(null);
      return;
    }
    const next = [...list];
    const [item] = next.splice(from, 1);
    next.splice(to, 0, item);
    void persistOrder(day, next);
  }

  const editing = editId
    ? (activities.find((a) => a.id === editId) ?? null)
    : null;
  const editStop = editing ? stopById.get(editing.stop_id) : null;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">
          Calendar & timeline
        </h1>
        <p className="text-sm text-muted-foreground">
          {tripName} · {tripStart} – {tripEnd}. Expand a day, drag to reorder,
          or quick-edit activities.
        </p>
      </div>

      {error ? (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      ) : null}

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)]">
        <section className="space-y-3">
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
              const count = byDay.get(iso)?.length ?? 0;
              const inTrip = iso >= tripStart && iso <= tripEnd;
              const selected = selectedDay === iso;
              return (
                <button
                  key={iso}
                  type="button"
                  disabled={!inTrip && count === 0}
                  onClick={() => selectCalendarDay(iso)}
                  className={cn(
                    "flex aspect-square flex-col items-center justify-center rounded-md border text-sm transition-colors",
                    count > 0
                      ? "border-primary bg-primary/10 font-semibold"
                      : "border-transparent",
                    inTrip && count === 0 && "bg-muted/40 text-muted-foreground",
                    selected && "ring-2 ring-primary",
                    !inTrip && count === 0 && "opacity-40"
                  )}
                >
                  <span>{dayNum}</span>
                  {count > 0 ? (
                    <span className="text-[10px] text-muted-foreground">
                      {count}
                    </span>
                  ) : null}
                </button>
              );
            })}
          </div>
          <p className="text-xs text-muted-foreground">
            Highlighted days have activities. Click a day to expand it in the
            timeline.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-semibold">Vertical timeline</h2>
          {dayKeys.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No days on this trip yet.
            </p>
          ) : (
            <ul className="space-y-2">
              {dayKeys.map((day, idx) => {
                const items = byDay.get(day) ?? [];
                const isOpen = expanded.has(day);
                return (
                  <li
                    key={day}
                    className="overflow-hidden rounded-xl border border-border"
                  >
                    <button
                      type="button"
                      onClick={() => toggleDay(day)}
                      className={cn(
                        "flex w-full items-center justify-between gap-2 px-3 py-2.5 text-left text-sm transition-colors hover:bg-muted/40",
                        selectedDay === day && "bg-muted/30"
                      )}
                      aria-expanded={isOpen}
                    >
                      <span className="font-medium">
                        Day {idx + 1}
                        <span className="ml-2 font-normal text-muted-foreground">
                          {day}
                        </span>
                      </span>
                      <Badge variant="outline">
                        {items.length} activit
                        {items.length === 1 ? "y" : "ies"}
                      </Badge>
                    </button>

                    {isOpen ? (
                      <div className="space-y-2 border-t border-border px-3 py-3">
                        {items.length === 0 ? (
                          <p className="text-sm text-muted-foreground">
                            No activities this day. Add some in the builder.
                          </p>
                        ) : (
                          items.map((a, i) => {
                            const stop = stopById.get(a.stop_id);
                            return (
                              <TimelineActivityRow
                                key={a.id}
                                activity={a}
                                cityLabel={
                                  stop
                                    ? `${stop.city_name}${stop.country ? `, ${stop.country}` : ""}`
                                    : undefined
                                }
                                index={i}
                                total={items.length}
                                busy={busy}
                                onEdit={() => setEditId(a.id)}
                                onMove={(dir) => moveActivity(day, i, dir)}
                                onDragStart={() => setDragId(a.id)}
                                onDragOver={(e) => {
                                  e.preventDefault();
                                }}
                                onDrop={() => dropOn(day, a.id)}
                              />
                            );
                          })
                        )}
                      </div>
                    ) : null}
                  </li>
                );
              })}
            </ul>
          )}
        </section>
      </div>

      <QuickEditActivitySheet
        tripId={tripId}
        activity={editing}
        stopStart={editStop?.start_date ?? tripStart}
        stopEnd={editStop?.end_date ?? tripEnd}
        open={Boolean(editing)}
        onOpenChange={(open) => {
          if (!open) setEditId(null);
        }}
        onSaved={(patch) => {
          setActivities((prev) =>
            prev.map((a) => (a.id === patch.id ? { ...a, ...patch } : a))
          );
          if (patch.day_date) {
            setExpanded((prev) => new Set(prev).add(patch.day_date!));
            setSelectedDay(patch.day_date);
          }
          router.refresh();
        }}
      />
    </div>
  );
}
