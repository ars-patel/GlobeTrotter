"use client";

import { useCallback, useEffect, useState } from "react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Spinner } from "@/components/ui/spinner";
import { Badge } from "@/components/ui/badge";

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
type Activity = {
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
  const [cityOptions, setCityOptions] = useState<Activity[]>([]);
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

  const reload = useCallback(async () => {
    const res = await fetch(`/api/trips/${tripId}/itinerary`);
    const data = await res.json();
    if (!res.ok) throw new Error(data.error ?? "Failed to load itinerary");
    setTrip(data.trip);
    setStops(data.stops ?? []);
    setActivities(data.activities ?? []);
  }, [tripId]);

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        await reload();
        const citiesRes = await fetch("/api/cities");
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
    const stop = stops.find((s) => s.id === selectedStopId);
    if (!stop) {
      setCityOptions([]);
      return;
    }
    (async () => {
      const res = await fetch(`/api/activities?cityId=${stop.city_id}`);
      const data = await res.json();
      setCityOptions(data.activities ?? []);
    })();
  }, [selectedStopId, stops]);

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
      await reload();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to add stop");
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
          Trip dates: {String(trip?.start_date).slice(0, 10)} –{" "}
          {String(trip?.end_date).slice(0, 10)}
        </p>
      </div>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold">Stops</h2>
        {stops.length === 0 ? (
          <p className="text-sm text-muted-foreground">No stops yet. Add a city.</p>
        ) : (
          <div className="grid gap-3">
            {stops.map((s) => (
              <Card key={s.id} className="border-border shadow-none">
                <CardHeader className="gap-1">
                  <CardTitle className="text-base">
                    {s.stop_order}. {s.city_name}
                  </CardTitle>
                  <CardDescription>
                    {s.country} · {String(s.start_date).slice(0, 10)} –{" "}
                    {String(s.end_date).slice(0, 10)}
                  </CardDescription>
                  <div className="flex flex-wrap gap-2 pt-1">
                    {activities
                      .filter((a) => a.stop_id === s.id)
                      .map((a) => (
                        <Badge key={a.id} variant="secondary">
                          {a.activity_name}
                          {a.start_time ? ` @ ${a.start_time}` : ""}
                        </Badge>
                      ))}
                  </div>
                </CardHeader>
              </Card>
            ))}
          </div>
        )}

        <form onSubmit={addStop} className="grid gap-3 rounded-lg border border-border p-4 sm:grid-cols-2">
          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="city">City</Label>
            <select
              id="city"
              className="flex h-8 w-full rounded-lg border border-input bg-transparent px-2.5 text-sm"
              value={cityId}
              onChange={(e) => setCityId(e.target.value)}
              required
            >
              <option value="">Select city…</option>
              {cities.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}, {c.country}
                </option>
              ))}
            </select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="ss">Stop start</Label>
            <Input id="ss" type="date" value={stopStart} onChange={(e) => setStopStart(e.target.value)} required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="se">Stop end</Label>
            <Input id="se" type="date" value={stopEnd} onChange={(e) => setStopEnd(e.target.value)} required />
          </div>
          <Button type="submit" disabled={busy} className="sm:col-span-2">
            Add Stop
          </Button>
        </form>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold">Add activity</h2>
        <form onSubmit={addActivity} className="grid gap-3 rounded-lg border border-border p-4 sm:grid-cols-2">
          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="stop">Stop</Label>
            <select
              id="stop"
              className="flex h-8 w-full rounded-lg border border-input bg-transparent px-2.5 text-sm"
              value={selectedStopId}
              onChange={(e) => setSelectedStopId(e.target.value)}
              required
            >
              <option value="">Select stop…</option>
              {stops.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.city_name}
                </option>
              ))}
            </select>
          </div>
          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="act">Activity</Label>
            <select
              id="act"
              className="flex h-8 w-full rounded-lg border border-input bg-transparent px-2.5 text-sm"
              value={activityId}
              onChange={(e) => setActivityId(e.target.value)}
              required
            >
              <option value="">Select activity…</option>
              {cityOptions.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.name} ({a.type}) — ${Number(a.cost).toFixed(0)}
                </option>
              ))}
            </select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="day">Day</Label>
            <Input id="day" type="date" value={dayDate} onChange={(e) => setDayDate(e.target.value)} required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="st">Start time</Label>
            <Input id="st" type="time" value={startTime} onChange={(e) => setStartTime(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="et">End time</Label>
            <Input id="et" type="time" value={endTime} onChange={(e) => setEndTime(e.target.value)} />
          </div>
          <Button type="submit" disabled={busy || !selectedStopId} className="sm:col-span-2">
            Add to my trip
          </Button>
        </form>
      </section>
    </div>
  );
}
