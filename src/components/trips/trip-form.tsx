"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Spinner } from "@/components/ui/spinner";
import { createTripSchema } from "@/lib/trips/schemas";

type Suggestion = { id: string; label: string };

export function TripForm() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [startPoint, setStartPoint] = useState("");
  const [endPoint, setEndPoint] = useState("");
  const [description, setDescription] = useState("");
  const [coverPhoto, setCoverPhoto] = useState("");
  const [budgetLimit, setBudgetLimit] = useState("");
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [selected, setSelected] = useState<Record<string, boolean>>({});
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [loadingPacking, setLoadingPacking] = useState(false);

  useEffect(() => {
    if (!startDate) {
      setSuggestions([]);
      return;
    }
    let cancelled = false;
    (async () => {
      setLoadingPacking(true);
      try {
        const res = await fetch(
          `/api/packing-suggestions?start_date=${encodeURIComponent(startDate)}`
        );
        const data = (await res.json()) as {
          suggestions?: Suggestion[];
          error?: string;
        };
        if (!res.ok) throw new Error(data.error ?? "Failed packing suggestions");
        if (cancelled) return;
        const list = data.suggestions ?? [];
        setSuggestions(list);
        const next: Record<string, boolean> = {};
        for (const s of list) next[s.id] = true;
        setSelected(next);
      } catch (e) {
        if (!cancelled) {
          setSuggestions([]);
          setError(e instanceof Error ? e.message : "Packing load failed");
        }
      } finally {
        if (!cancelled) setLoadingPacking(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [startDate]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    const packing_items = suggestions
      .filter((s) => selected[s.id])
      .map((s) => ({ label: s.label, checked: false }));

    const parsed = createTripSchema.safeParse({
      name,
      start_date: startDate,
      end_date: endDate,
      start_point: startPoint,
      end_point: endPoint,
      description: description || undefined,
      cover_photo: coverPhoto || undefined,
      budget_limit: budgetLimit === "" ? null : Number(budgetLimit),
      packing_items,
    });

    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? "Invalid input");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/trips", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(parsed.data),
      });
      const data = (await res.json()) as { trip?: { id: string }; error?: string };
      if (!res.ok) {
        setError(data.error ?? "Unable to create trip");
        return;
      }
      router.push(`/trips/${data.trip!.id}/builder`);
      router.refresh();
    } catch {
      setError("Unable to create trip. Try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-6">
      {error ? (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      ) : null}

      <div className="space-y-4">
        <h1 className="text-2xl font-semibold tracking-tight">Plan your trip</h1>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="name">Trip Name</Label>
            <Input id="name" value={name} onChange={(e) => setName(e.target.value)} disabled={loading} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="start_date">Start Date</Label>
            <Input id="start_date" type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} disabled={loading} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="end_date">End Date</Label>
            <Input id="end_date" type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} disabled={loading} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="start_point">Start Point</Label>
            <Input id="start_point" value={startPoint} onChange={(e) => setStartPoint(e.target.value)} disabled={loading} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="end_point">End Point</Label>
            <Input id="end_point" value={endPoint} onChange={(e) => setEndPoint(e.target.value)} disabled={loading} />
          </div>
          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="description">Description (optional)</Label>
            <Textarea id="description" value={description} onChange={(e) => setDescription(e.target.value)} disabled={loading} rows={3} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="cover">Cover photo URL (optional)</Label>
            <Input id="cover" value={coverPhoto} onChange={(e) => setCoverPhoto(e.target.value)} disabled={loading} placeholder="https://..." />
          </div>
          <div className="space-y-2">
            <Label htmlFor="budget">Budget limit (optional)</Label>
            <Input id="budget" type="number" min={0} step="0.01" value={budgetLimit} onChange={(e) => setBudgetLimit(e.target.value)} disabled={loading} />
          </div>
        </div>
      </div>

      <div className="space-y-3">
        <div>
          <h2 className="text-base font-semibold">Suggest the items for trip (based on weather)</h2>
          <p className="text-sm text-muted-foreground">
            Suggestions load from the database for your start date.
          </p>
        </div>
        {loadingPacking ? (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Spinner /> Loading suggestions…
          </div>
        ) : suggestions.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            Pick a start date to load packing suggestions.
          </p>
        ) : (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            {suggestions.map((s) => (
              <Card key={s.id} className="border-border shadow-none">
                <CardHeader className="flex flex-row items-start gap-3 space-y-0 p-3">
                  <Checkbox
                    checked={Boolean(selected[s.id])}
                    onCheckedChange={(v) =>
                      setSelected((prev) => ({ ...prev, [s.id]: Boolean(v) }))
                    }
                  />
                  <CardTitle className="text-sm font-medium leading-snug">
                    {s.label}
                  </CardTitle>
                </CardHeader>
              </Card>
            ))}
          </div>
        )}
      </div>

      <Button type="submit" disabled={loading}>
        {loading ? (
          <>
            <Spinner data-icon="inline-start" />
            Saving…
          </>
        ) : (
          "Save trip"
        )}
      </Button>
    </form>
  );
}
