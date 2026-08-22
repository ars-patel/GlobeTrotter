"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { NativeSelect, NativeSelectOption } from "@/components/ui/native-select";
import { Spinner } from "@/components/ui/spinner";

type TripOption = {
  id: string;
  name: string;
  start_date: string;
  end_date: string;
};

type StopOption = {
  id: string;
  city_id: string;
  city_name: string;
  start_date: string;
  end_date: string;
};

export function AddActivityToTripButton({
  activityId,
  activityName,
  cityId,
  preferredTripId,
  preferredStopId,
}: {
  activityId: string;
  activityName: string;
  cityId: string;
  preferredTripId?: string;
  preferredStopId?: string;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [trips, setTrips] = useState<TripOption[]>([]);
  const [stops, setStops] = useState<StopOption[]>([]);
  const [tripId, setTripId] = useState(preferredTripId ?? "");
  const [stopId, setStopId] = useState(preferredStopId ?? "");
  const [dayDate, setDayDate] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [loading, setLoading] = useState(false);
  const [loadingMeta, setLoadingMeta] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const matchingStops = useMemo(
    () => stops.filter((s) => s.city_id === cityId),
    [stops, cityId]
  );

  useEffect(() => {
    if (!open) return;
    let cancelled = false;
    (async () => {
      setLoadingMeta(true);
      setError(null);
      try {
        const res = await fetch("/api/trips");
        const data = await res.json();
        if (!res.ok) throw new Error(data.error ?? "Failed to load trips");
        const list: TripOption[] = [
          ...(data.ongoing ?? []),
          ...(data.upcoming ?? []),
          ...(data.completed ?? []),
        ].map((t: TripOption) => ({
          id: t.id,
          name: t.name,
          start_date: String(t.start_date).slice(0, 10),
          end_date: String(t.end_date).slice(0, 10),
        }));
        if (cancelled) return;
        setTrips(list);
        setTripId((current) => {
          if (current && list.some((t) => t.id === current)) return current;
          if (preferredTripId && list.some((t) => t.id === preferredTripId)) {
            return preferredTripId;
          }
          return list[0]?.id ?? "";
        });
      } catch (e) {
        if (!cancelled) {
          setError(e instanceof Error ? e.message : "Failed to load trips");
        }
      } finally {
        if (!cancelled) setLoadingMeta(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [open, preferredTripId]);

  useEffect(() => {
    if (!open || !tripId) {
      setStops([]);
      return;
    }
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch(`/api/trips/${tripId}/itinerary`);
        const data = await res.json();
        if (!res.ok) throw new Error(data.error ?? "Failed to load stops");
        if (cancelled) return;
        const list: StopOption[] = (data.stops ?? []).map(
          (s: Record<string, unknown>) => ({
            id: String(s.id),
            city_id: String(s.city_id),
            city_name: String(s.city_name),
            start_date: String(s.start_date).slice(0, 10),
            end_date: String(s.end_date).slice(0, 10),
          })
        );
        setStops(list);
        const match = list.filter((s) => s.city_id === cityId);
        setStopId((current) => {
          if (preferredStopId && match.some((s) => s.id === preferredStopId)) {
            return preferredStopId;
          }
          if (current && match.some((s) => s.id === current)) return current;
          return match[0]?.id ?? "";
        });
        const first = match[0];
        if (first) setDayDate(first.start_date);
      } catch (e) {
        if (!cancelled) {
          setError(e instanceof Error ? e.message : "Failed to load stops");
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [open, tripId, cityId, preferredStopId]);

  useEffect(() => {
    const stop = matchingStops.find((s) => s.id === stopId);
    if (stop && (!dayDate || dayDate < stop.start_date || dayDate > stop.end_date)) {
      setDayDate(stop.start_date);
    }
  }, [stopId, matchingStops, dayDate]);

  async function addActivity() {
    if (!tripId || !stopId || !dayDate) {
      setError("Select a trip, matching city stop, and day");
      return;
    }
    if (startTime && endTime && endTime < startTime) {
      setError("End time must be on or after start time");
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const res = await fetch(
        `/api/trips/${tripId}/stops/${stopId}/activities`,
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
      setOpen(false);
      router.push(`/trips/${tripId}/builder`);
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to add activity");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button type="button" size="sm" />}>
        Add to Trip
      </DialogTrigger>
      <DialogContent className="max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add “{activityName}”</DialogTitle>
          <DialogDescription>
            Choose a trip stop in the same city, then set the day and optional
            times.
          </DialogDescription>
        </DialogHeader>

        {error ? (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        ) : null}

        {loadingMeta ? (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Spinner /> Loading trips…
          </div>
        ) : trips.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            Create a trip and add this city as a stop first.
          </p>
        ) : (
          <div className="grid gap-3">
            <div className="space-y-2">
              <Label htmlFor={`trip-${activityId}`}>Trip</Label>
              <NativeSelect
                id={`trip-${activityId}`}
                className="w-full"
                value={tripId}
                onChange={(e) => setTripId(e.target.value)}
              >
                {trips.map((t) => (
                  <NativeSelectOption key={t.id} value={t.id}>
                    {t.name}
                  </NativeSelectOption>
                ))}
              </NativeSelect>
            </div>

            <div className="space-y-2">
              <Label htmlFor={`stop-${activityId}`}>Stop (same city)</Label>
              {matchingStops.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  No stop for this activity’s city on the selected trip. Add the
                  city in the builder first.
                </p>
              ) : (
                <NativeSelect
                  id={`stop-${activityId}`}
                  className="w-full"
                  value={stopId}
                  onChange={(e) => setStopId(e.target.value)}
                >
                  {matchingStops.map((s) => (
                    <NativeSelectOption key={s.id} value={s.id}>
                      {s.city_name} ({s.start_date} – {s.end_date})
                    </NativeSelectOption>
                  ))}
                </NativeSelect>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor={`day-${activityId}`}>Day</Label>
              <Input
                id={`day-${activityId}`}
                type="date"
                value={dayDate}
                onChange={(e) => setDayDate(e.target.value)}
              />
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor={`st-${activityId}`}>Start time</Label>
                <Input
                  id={`st-${activityId}`}
                  type="time"
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor={`et-${activityId}`}>End time</Label>
                <Input
                  id={`et-${activityId}`}
                  type="time"
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                />
              </div>
            </div>
          </div>
        )}

        <DialogFooter>
          {trips.length === 0 ? (
            <Button type="button" onClick={() => router.push("/trips/new")}>
              Plan New Trip
            </Button>
          ) : (
            <Button
              type="button"
              onClick={addActivity}
              disabled={loading || matchingStops.length === 0 || !stopId}
            >
              {loading ? (
                <>
                  <Spinner data-icon="inline-start" />
                  Adding…
                </>
              ) : (
                "Add to my trip"
              )}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
