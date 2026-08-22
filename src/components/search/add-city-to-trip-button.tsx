"use client";

import { useEffect, useState } from "react";
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
import { Label } from "@/components/ui/label";
import { NativeSelect, NativeSelectOption } from "@/components/ui/native-select";
import { Spinner } from "@/components/ui/spinner";

type TripOption = {
  id: string;
  name: string;
  start_date: string;
  end_date: string;
};

export function AddCityToTripButton({
  cityId,
  cityName,
  preferredTripId,
}: {
  cityId: string;
  cityName: string;
  preferredTripId?: string;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [trips, setTrips] = useState<TripOption[]>([]);
  const [tripId, setTripId] = useState(preferredTripId ?? "");
  const [loading, setLoading] = useState(false);
  const [loadingTrips, setLoadingTrips] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    let cancelled = false;
    (async () => {
      setLoadingTrips(true);
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
        if (!cancelled) {
          setTrips(list);
          setTripId((current) => {
            if (current && list.some((t) => t.id === current)) return current;
            if (preferredTripId && list.some((t) => t.id === preferredTripId)) {
              return preferredTripId;
            }
            return list[0]?.id ?? "";
          });
        }
      } catch (e) {
        if (!cancelled) {
          setError(e instanceof Error ? e.message : "Failed to load trips");
        }
      } finally {
        if (!cancelled) setLoadingTrips(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [open, preferredTripId]);

  async function addToTrip() {
    if (!tripId) {
      setError("Select a trip first");
      return;
    }
    const trip = trips.find((t) => t.id === tripId);
    if (!trip) {
      setError("Select a trip first");
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/trips/${tripId}/stops`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          city_id: cityId,
          start_date: trip.start_date,
          end_date: trip.end_date,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Failed to add city");
      setOpen(false);
      router.push(`/trips/${tripId}/builder`);
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to add city");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={<Button type="button" size="sm" />}
      >
        Add to Trip
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add {cityName} to a trip</DialogTitle>
          <DialogDescription>
            Creates a stop using the trip’s full date range. You can tighten
            dates in the builder afterward.
          </DialogDescription>
        </DialogHeader>

        {error ? (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        ) : null}

        {loadingTrips ? (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Spinner /> Loading your trips…
          </div>
        ) : trips.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            You don’t have a trip yet. Create one first, then add cities.
          </p>
        ) : (
          <div className="space-y-2">
            <Label htmlFor={`trip-${cityId}`}>Trip</Label>
            <NativeSelect
              id={`trip-${cityId}`}
              className="w-full"
              value={tripId}
              onChange={(e) => setTripId(e.target.value)}
            >
              {trips.map((t) => (
                <NativeSelectOption key={t.id} value={t.id}>
                  {t.name} ({t.start_date} – {t.end_date})
                </NativeSelectOption>
              ))}
            </NativeSelect>
          </div>
        )}

        <DialogFooter>
          {trips.length === 0 ? (
            <Button
              type="button"
              onClick={() => router.push("/trips/new")}
            >
              Plan New Trip
            </Button>
          ) : (
            <Button type="button" onClick={addToTrip} disabled={loading || !tripId}>
              {loading ? (
                <>
                  <Spinner data-icon="inline-start" />
                  Adding…
                </>
              ) : (
                "Add to Trip"
              )}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
