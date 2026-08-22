"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Spinner } from "@/components/ui/spinner";
import { Textarea } from "@/components/ui/textarea";
import { CoverPhotoField } from "@/components/trips/cover-photo-field";
import { updateTripSchema } from "@/lib/trips/schemas";
import { cn } from "@/lib/utils";

export type EditableTrip = {
  id: string;
  name: string;
  description: string | null;
  cover_photo: string | null;
  start_date: string;
  end_date: string;
  start_point: string | null;
  end_point: string | null;
  budget_limit: number | string | null;
};

export function EditTripForm({ trip }: { trip: EditableTrip }) {
  const router = useRouter();
  const [name, setName] = useState(trip.name);
  const [startDate, setStartDate] = useState(
    String(trip.start_date).slice(0, 10)
  );
  const [endDate, setEndDate] = useState(String(trip.end_date).slice(0, 10));
  const [startPoint, setStartPoint] = useState(trip.start_point ?? "");
  const [endPoint, setEndPoint] = useState(trip.end_point ?? "");
  const [description, setDescription] = useState(trip.description ?? "");
  const [coverPhoto, setCoverPhoto] = useState(trip.cover_photo ?? "");
  const [budgetLimit, setBudgetLimit] = useState(
    trip.budget_limit == null ? "" : String(trip.budget_limit)
  );
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    const parsed = updateTripSchema.safeParse({
      name,
      start_date: startDate,
      end_date: endDate,
      start_point: startPoint,
      end_point: endPoint,
      description: description || null,
      cover_photo: coverPhoto || null,
      budget_limit: budgetLimit === "" ? null : Number(budgetLimit),
    });

    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? "Invalid input");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`/api/trips/${trip.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(parsed.data),
      });
      const data = (await res.json()) as { error?: string };
      if (!res.ok) {
        setError(data.error ?? "Unable to save trip");
        return;
      }
      router.push("/trips");
      router.refresh();
    } catch {
      setError("Unable to save trip. Try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-6" noValidate>
      {error ? (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      ) : null}

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2 sm:col-span-2">
          <Label htmlFor="name">Trip name *</Label>
          <Input
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            disabled={loading}
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="start_date">Start date *</Label>
          <Input
            id="start_date"
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            disabled={loading}
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="end_date">End date *</Label>
          <Input
            id="end_date"
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            disabled={loading}
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="start_point">Start point *</Label>
          <Input
            id="start_point"
            value={startPoint}
            onChange={(e) => setStartPoint(e.target.value)}
            disabled={loading}
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="end_point">End point *</Label>
          <Input
            id="end_point"
            value={endPoint}
            onChange={(e) => setEndPoint(e.target.value)}
            disabled={loading}
            required
          />
        </div>
        <div className="space-y-2 sm:col-span-2">
          <Label htmlFor="description">Description</Label>
          <Textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            disabled={loading}
            rows={3}
          />
        </div>
        <CoverPhotoField
          value={coverPhoto}
          onChange={setCoverPhoto}
          disabled={loading}
        />
        <div className="space-y-2 sm:col-span-2">
          <Label htmlFor="budget">Budget limit</Label>
          <Input
            id="budget"
            type="number"
            min={0}
            step="0.01"
            value={budgetLimit}
            onChange={(e) => setBudgetLimit(e.target.value)}
            disabled={loading}
            placeholder="Optional"
          />
        </div>
      </div>

      <div className="flex flex-wrap gap-2 border-t border-border pt-4">
        <Button type="submit" disabled={loading}>
          {loading ? (
            <>
              <Spinner data-icon="inline-start" />
              Saving…
            </>
          ) : (
            "Save changes"
          )}
        </Button>
        <Link
          href="/trips"
          className={cn(buttonVariants({ variant: "outline" }))}
        >
          Cancel
        </Link>
        <Link
          href={`/trips/${trip.id}/builder`}
          className={cn(buttonVariants({ variant: "ghost" }))}
        >
          Open builder
        </Link>
      </div>
    </form>
  );
}
