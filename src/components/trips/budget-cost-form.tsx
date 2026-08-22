"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { NativeSelect, NativeSelectOption } from "@/components/ui/native-select";
import { Spinner } from "@/components/ui/spinner";
import { MANUAL_BUDGET_CATEGORIES } from "@/lib/trips/budget-categories";

const MANUAL_CATEGORIES = MANUAL_BUDGET_CATEGORIES;

export function BudgetCostForm({
  tripId,
  tripStart,
  tripEnd,
}: {
  tripId: string;
  tripStart: string;
  tripEnd: string;
}) {
  const router = useRouter();
  const [category, setCategory] = useState<(typeof MANUAL_CATEGORIES)[number]>(
    "TRANSPORT"
  );
  const [label, setLabel] = useState("");
  const [amount, setAmount] = useState("");
  const [dayDate, setDayDate] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    const value = Number(amount);
    if (Number.isNaN(value) || value < 0) {
      setError("Enter a valid amount");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`/api/trips/${tripId}/costs`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          category,
          label: label || null,
          amount: value,
          day_date: dayDate || null,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Failed to add cost");
      setLabel("");
      setAmount("");
      setDayDate("");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to add cost");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form
      onSubmit={onSubmit}
      className="grid gap-3 rounded-xl border border-border p-4 sm:grid-cols-2"
    >
      <div className="sm:col-span-2">
        <h3 className="text-sm font-semibold">Add cost line</h3>
        <p className="text-xs text-muted-foreground">
          Transport, stay, meals, and other expenses (activities come from your
          itinerary).
        </p>
      </div>

      {error ? (
        <Alert variant="destructive" className="sm:col-span-2">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      ) : null}

      <div className="space-y-2">
        <Label htmlFor="category">Category</Label>
        <NativeSelect
          id="category"
          className="w-full"
          value={category}
          onChange={(e) =>
            setCategory(e.target.value as (typeof MANUAL_CATEGORIES)[number])
          }
        >
          {MANUAL_CATEGORIES.map((c) => (
            <NativeSelectOption key={c} value={c}>
              {c}
            </NativeSelectOption>
          ))}
        </NativeSelect>
      </div>
      <div className="space-y-2">
        <Label htmlFor="amount">Amount</Label>
        <Input
          id="amount"
          type="number"
          min={0}
          step="0.01"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          required
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="label">Label</Label>
        <Input
          id="label"
          value={label}
          onChange={(e) => setLabel(e.target.value)}
          placeholder="e.g. Hotel night 1"
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="day">Day (optional)</Label>
        <Input
          id="day"
          type="date"
          min={tripStart}
          max={tripEnd}
          value={dayDate}
          onChange={(e) => setDayDate(e.target.value)}
        />
      </div>
      <Button type="submit" disabled={loading} className="sm:col-span-2">
        {loading ? (
          <>
            <Spinner data-icon="inline-start" />
            Saving…
          </>
        ) : (
          "Add cost"
        )}
      </Button>
    </form>
  );
}
