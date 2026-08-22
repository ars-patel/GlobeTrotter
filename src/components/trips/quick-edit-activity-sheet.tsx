"use client";

import { useEffect, useState } from "react";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Spinner } from "@/components/ui/spinner";
import { Textarea } from "@/components/ui/textarea";
import type { TimelineActivity } from "@/components/trips/trip-calendar-timeline";

function toInputTime(value: string | null | undefined) {
  if (!value) return "";
  return value.slice(0, 5);
}

export function QuickEditActivitySheet({
  tripId,
  activity,
  stopStart,
  stopEnd,
  open,
  onOpenChange,
  onSaved,
}: {
  tripId: string;
  activity: TimelineActivity | null;
  stopStart: string;
  stopEnd: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSaved: (next: Partial<TimelineActivity> & { id: string }) => void;
}) {
  const [dayDate, setDayDate] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [notes, setNotes] = useState("");
  const [cost, setCost] = useState("");
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!activity) return;
    setDayDate(activity.day_date);
    setStartTime(toInputTime(activity.start_time));
    setEndTime(toInputTime(activity.end_time));
    setNotes(activity.notes ?? "");
    const c =
      activity.custom_cost == null
        ? Number(activity.cost ?? 0)
        : Number(activity.custom_cost);
    setCost(c.toFixed(2));
    setDone(Boolean(activity.is_done));
    setError(null);
  }, [activity]);

  async function save() {
    if (!activity) return;
    setError(null);
    const amount = Number(cost);
    if (Number.isNaN(amount) || amount < 0) {
      setError("Enter a valid cost");
      return;
    }
    if (dayDate < stopStart || dayDate > stopEnd) {
      setError("Day must be within this stop's dates");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`/api/trips/${tripId}/activities/${activity.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          day_date: dayDate,
          start_time: startTime || null,
          end_time: endTime || null,
          notes: notes.trim() ? notes.trim() : null,
          custom_cost: amount,
          is_done: done,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Failed to save");
      onSaved({
        id: activity.id,
        day_date: dayDate,
        start_time: startTime || null,
        end_time: endTime || null,
        notes: notes.trim() ? notes.trim() : null,
        custom_cost: amount,
        is_done: done,
      });
      onOpenChange(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full sm:max-w-md">
        <SheetHeader>
          <SheetTitle>Quick edit</SheetTitle>
          <SheetDescription>
            {activity?.activity_name ?? "Activity"} — update time, day, cost, or
            notes.
          </SheetDescription>
        </SheetHeader>

        <div className="flex flex-1 flex-col gap-4 overflow-y-auto px-4">
          {error ? (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          ) : null}

          <div className="space-y-2">
            <Label htmlFor="qe-day">Day</Label>
            <Input
              id="qe-day"
              type="date"
              min={stopStart}
              max={stopEnd}
              value={dayDate}
              onChange={(e) => setDayDate(e.target.value)}
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="qe-start">Start</Label>
              <Input
                id="qe-start"
                type="time"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="qe-end">End</Label>
              <Input
                id="qe-end"
                type="time"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="qe-cost">Cost ($)</Label>
            <Input
              id="qe-cost"
              type="number"
              min={0}
              step="0.01"
              value={cost}
              onChange={(e) => setCost(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="qe-notes">Notes</Label>
            <Textarea
              id="qe-notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              placeholder="Optional notes"
            />
          </div>
          <label className="flex items-center gap-2 text-sm">
            <Checkbox
              checked={done}
              onCheckedChange={(v) => setDone(Boolean(v))}
            />
            Mark as done
          </label>
        </div>

        <SheetFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={loading}
          >
            Cancel
          </Button>
          <Button type="button" onClick={() => void save()} disabled={loading}>
            {loading ? (
              <>
                <Spinner data-icon="inline-start" />
                Saving…
              </>
            ) : (
              "Save changes"
            )}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
