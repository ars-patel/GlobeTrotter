"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import {
  ArrowDownIcon,
  ArrowUpIcon,
  Trash2Icon,
} from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { NativeSelect, NativeSelectOption } from "@/components/ui/native-select";
import { Separator } from "@/components/ui/separator";
import { Spinner } from "@/components/ui/spinner";
import { cn } from "@/lib/utils";

type City = { id: string; name: string; country: string };
type Stop = {
  id: string;
  city_id: string;
  city_name: string;
  country: string;
  start_date: string;
  end_date: string;
  stop_order: number;
};
type CatalogActivity = {
  id: string;
  name: string;
  description: string | null;
  type: string;
  cost: string | number;
};
type TripActivity = {
  id: string;
  stop_id: string;
  activity_name: string;
  day_date: string;
  start_time: string | null;
  end_time: string | null;
  cost: string | number;
  custom_cost: string | number | null;
};

export function ItineraryBuilder({ tripId }: { tripId: string }) {
  const [trip, setTrip] = useState<{
    name: string;
    start_date: string;
    end_date: string;
  } | null>(null);
  const [stops, setStops] = useState<Stop[]>([]);
  const [activities, setActivities] = useState<TripActivity[]>([]);
  const [cities, setCities] = useState<City[]>([]);
  const [cityOptions, setCityOptions] = useState<CatalogActivity[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const [cityId, setCityId] = useState("");
  const [stopStart, setStopStart] = useState("");
  const [stopEnd, setStopEnd] = useState("");
  const [selectedStopId, setSelectedStopId] = useState("");
  const [activityId, setActivityId] = useState("");
  const [dayDate, setDayDate] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [busy, setBusy] = useState(false);
  const [showAddStop, setShowAddStop] = useState(false);

  const reload = useCallback(async () => {
    const res = await fetch(`/api/trips/${tripId}/itinerary`);
    const data = await res.json();
    if (!res.ok) throw new Error(data.error ?? "Failed to load itinerary");
    setTrip({
      name: data.trip.name,
      start_date: String(data.trip.start_date).slice(0, 10),
      end_date: String(data.trip.end_date).slice(0, 10),
    });
    setStops(
      (data.stops ?? []).map((s: Stop) => ({
        ...s,
        start_date: String(s.start_date).slice(0, 10),
        end_date: String(s.end_date).slice(0, 10),
      }))
    );
    setActivities(
      (data.activities ?? []).map((a: TripActivity) => ({
        ...a,
        day_date: String(a.day_date).slice(0, 10),
      }))
    );
  }, [tripId]);

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        await reload();
        const citiesRes = await fetch("/api/cities?limit=100");
        const citiesData = await citiesRes.json();
        setCities(citiesData.cities ?? []);
      } catch (e) {
        setError(e instanceof Error ? e.message : "Load failed");
      } finally {
        setLoading(false);
      }
    })();
  }, [reload]);

  useEffect(() => {
    if (!trip) return;
    if (!stopStart) setStopStart(trip.start_date);
    if (!stopEnd) setStopEnd(trip.end_date);
  }, [trip, stopStart, stopEnd]);

  useEffect(() => {
    const stop = stops.find((s) => s.id === selectedStopId);
    if (!stop) {
      setCityOptions([]);
      return;
    }
    (async () => {
      const res = await fetch(`/api/activities?cityId=${stop.city_id}`);
      const data = await res.json();
      setCityOptions(data.activities ?? []);
      if (!dayDate) setDayDate(stop.start_date);
    })();
  }, [selectedStopId, stops, dayDate]);

  async function addStop(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      const res = await fetch(`/api/trips/${tripId}/stops`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          city_id: cityId,
          start_date: stopStart,
          end_date: stopEnd,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Failed to add stop");
      setCityId("");
      setShowAddStop(false);
      await reload();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to add stop");
    } finally {
      setBusy(false);
    }
  }

  async function deleteStop(stopId: string, cityName: string) {
    if (
      !window.confirm(
        `Remove ${cityName} from this trip? Activities on this stop will also be deleted.`
      )
    ) {
      return;
    }
    setBusy(true);
    setError(null);
    try {
      const res = await fetch(`/api/trips/${tripId}/stops/${stopId}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Failed to delete stop");
      if (selectedStopId === stopId) setSelectedStopId("");
      await reload();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete stop");
    } finally {
      setBusy(false);
    }
  }

  async function moveStop(stopId: string, direction: "up" | "down") {
    const index = stops.findIndex((s) => s.id === stopId);
    if (index < 0) return;
    const target = direction === "up" ? index - 1 : index + 1;
    if (target < 0 || target >= stops.length) return;

    const next = [...stops];
    const [item] = next.splice(index, 1);
    next.splice(target, 0, item);
    const stop_ids = next.map((s) => s.id);

    setBusy(true);
    setError(null);
    setStops(next.map((s, i) => ({ ...s, stop_order: i + 1 })));
    try {
      const res = await fetch(`/api/trips/${tripId}/stops/reorder`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ stop_ids }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Failed to reorder cities");
      await reload();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to reorder");
      await reload();
    } finally {
      setBusy(false);
    }
  }

  async function addActivity(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      const res = await fetch(
        `/api/trips/${tripId}/stops/${selectedStopId}/activities`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            activity_id: activityId,
            day_date: dayDate,
            start_time: startTime || undefined,
            end_time: endTime || undefined,
          }),
        }
      );
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Failed to add activity");
      setActivityId("");
      await reload();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to add activity");
    } finally {
      setBusy(false);
    }
  }

  async function removeActivity(stopId: string, activityRowId: string) {
    setBusy(true);
    setError(null);
    try {
      const res = await fetch(
        `/api/trips/${tripId}/stops/${stopId}/activities/${activityRowId}`,
        { method: "DELETE" }
      );
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Failed to remove activity");
      await reload();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to remove activity");
    } finally {
      setBusy(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Spinner /> Loading builder…
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {error ? (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      ) : null}

      <div>
        <h1 className="text-2xl font-semibold tracking-tight">
          {trip?.name ?? "Itinerary Builder"}
        </h1>
        <p className="text-sm text-muted-foreground">
          Add cities, set stop dates, assign activities, and reorder the route.
          Trip window: {trip?.start_date} – {trip?.end_date}
        </p>
      </div>

      <section className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-semibold">Cities / stops</h2>
            <p className="text-sm text-muted-foreground">
              Use arrows to reorder cities in your itinerary
            </p>
          </div>
          <Button
            type="button"
            onClick={() => setShowAddStop((v) => !v)}
            disabled={busy}
          >
            {showAddStop ? "Cancel" : "Add Stop"}
          </Button>
        </div>

        {stops.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            No stops yet. Click Add Stop to choose a city and dates.
          </p>
        ) : (
          <div className="grid gap-3">
            {stops.map((s, index) => {
              const stopActs = activities.filter((a) => a.stop_id === s.id);
              return (
                <Card key={s.id} className="border-border shadow-none">
                  <CardHeader className="gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div className="min-w-0 space-y-1">
                      <CardTitle className="text-base">
                        {s.stop_order}. {s.city_name}
                      </CardTitle>
                      <CardDescription>
                        {s.country} · {s.start_date} – {s.end_date}
                      </CardDescription>
                    </div>
                    <div className="flex flex-wrap gap-1">
                      <Button
                        type="button"
                        size="icon-sm"
                        variant="outline"
                        disabled={busy || index === 0}
                        onClick={() => moveStop(s.id, "up")}
                        aria-label={`Move ${s.city_name} up`}
                      >
                        <ArrowUpIcon />
                      </Button>
                      <Button
                        type="button"
                        size="icon-sm"
                        variant="outline"
                        disabled={busy || index === stops.length - 1}
                        onClick={() => moveStop(s.id, "down")}
                        aria-label={`Move ${s.city_name} down`}
                      >
                        <ArrowDownIcon />
                      </Button>
                      <Button
                        type="button"
                        size="icon-sm"
                        variant="ghost"
                        className="text-destructive"
                        disabled={busy}
                        onClick={() => deleteStop(s.id, s.city_name)}
                        aria-label={`Remove ${s.city_name}`}
                      >
                        <Trash2Icon />
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    {stopActs.length === 0 ? (
                      <p className="text-xs text-muted-foreground">
                        No activities assigned yet.
                      </p>
                    ) : (
                      <ul className="space-y-2">
                        {stopActs.map((a) => (
                          <li
                            key={a.id}
                            className="flex items-center justify-between gap-2 rounded-lg border border-border px-3 py-2 text-sm"
                          >
                            <div className="min-w-0">
                              <p className="font-medium">{a.activity_name}</p>
                              <p className="text-xs text-muted-foreground">
                                {a.day_date}
                                {a.start_time ? ` · ${a.start_time}` : ""}
                                {a.end_time ? `–${a.end_time}` : ""}
                                {" · "}$
                                {Number(a.custom_cost ?? a.cost ?? 0).toFixed(0)}
                              </p>
                            </div>
                            <Button
                              type="button"
                              size="sm"
                              variant="ghost"
                              className="text-destructive"
                              disabled={busy}
                              onClick={() => removeActivity(s.id, a.id)}
                            >
                              Remove
                            </Button>
                          </li>
                        ))}
                      </ul>
                    )}
                    <Link
                      href={`/trips/${tripId}/activities?stopId=${encodeURIComponent(s.id)}`}
                      className={cn(buttonVariants({ size: "sm", variant: "secondary" }))}
                    >
                      Assign activity
                    </Link>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}

        {showAddStop ? (
          <form
            onSubmit={addStop}
            className="grid gap-3 rounded-lg border border-border p-4 sm:grid-cols-2"
          >
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="city">Select city</Label>
              <NativeSelect
                id="city"
                className="w-full"
                value={cityId}
                onChange={(e) => setCityId(e.target.value)}
                required
              >
                <NativeSelectOption value="">Choose a city…</NativeSelectOption>
                {cities.map((c) => (
                  <NativeSelectOption key={c.id} value={c.id}>
                    {c.name}, {c.country}
                  </NativeSelectOption>
                ))}
              </NativeSelect>
            </div>
            <div className="space-y-2">
              <Label htmlFor="ss">Stop start date</Label>
              <Input
                id="ss"
                type="date"
                value={stopStart}
                min={trip?.start_date}
                max={trip?.end_date}
                onChange={(e) => setStopStart(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="se">Stop end date</Label>
              <Input
                id="se"
                type="date"
                value={stopEnd}
                min={stopStart || trip?.start_date}
                max={trip?.end_date}
                onChange={(e) => setStopEnd(e.target.value)}
                required
              />
            </div>
            <Button type="submit" disabled={busy} className="sm:col-span-2">
              {busy ? (
                <>
                  <Spinner data-icon="inline-start" />
                  Saving…
                </>
              ) : (
                "Save stop"
              )}
            </Button>
          </form>
        ) : null}
      </section>

      <Separator />

      <section className="space-y-3">
        <div>
          <h2 className="text-lg font-semibold">Assign activities</h2>
          <p className="text-sm text-muted-foreground">
            Pick a stop, then add catalog activities for a day in that stop’s
            date range.
          </p>
        </div>
        <form
          onSubmit={addActivity}
          className="grid gap-3 rounded-lg border border-border p-4 sm:grid-cols-2"
        >
          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="stop">Stop</Label>
            <NativeSelect
              id="stop"
              className="w-full"
              value={selectedStopId}
              onChange={(e) => setSelectedStopId(e.target.value)}
              required
            >
              <NativeSelectOption value="">Select stop…</NativeSelectOption>
              {stops.map((s) => (
                <NativeSelectOption key={s.id} value={s.id}>
                  {s.stop_order}. {s.city_name}
                </NativeSelectOption>
              ))}
            </NativeSelect>
          </div>
          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="act">Activity</Label>
            <NativeSelect
              id="act"
              className="w-full"
              value={activityId}
              onChange={(e) => setActivityId(e.target.value)}
              required
              disabled={!selectedStopId}
            >
              <NativeSelectOption value="">
                {selectedStopId ? "Select activity…" : "Select a stop first"}
              </NativeSelectOption>
              {cityOptions.map((a) => (
                <NativeSelectOption key={a.id} value={a.id}>
                  {a.name} ({a.type}) — ${Number(a.cost).toFixed(0)}
                </NativeSelectOption>
              ))}
            </NativeSelect>
            {selectedStopId && cityOptions.length === 0 ? (
              <p className="text-xs text-muted-foreground">
                No activities in the catalog for this city yet.
              </p>
            ) : null}
          </div>
          <div className="space-y-2">
            <Label htmlFor="day">Day</Label>
            <Input
              id="day"
              type="date"
              value={dayDate}
              onChange={(e) => setDayDate(e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="st">Start time</Label>
            <Input
              id="st"
              type="time"
              value={startTime}
              onChange={(e) => setStartTime(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="et">End time</Label>
            <Input
              id="et"
              type="time"
              value={endTime}
              onChange={(e) => setEndTime(e.target.value)}
            />
          </div>
          <div className="flex items-end">
            {selectedStopId ? (
              <Badge variant="outline">
                {
                  stops.find((s) => s.id === selectedStopId)?.city_name
                }
              </Badge>
            ) : null}
          </div>
          <Button
            type="submit"
            disabled={busy || !selectedStopId}
            className="sm:col-span-2"
          >
            Add to my trip
          </Button>
        </form>
      </section>
    </div>
  );
}
