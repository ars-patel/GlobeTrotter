"use client";

import { useEffect, useState } from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { ItineraryActivity } from "@/components/trips/itinerary-view";

export function ItineraryActivityBlock({
  activity,
  onToggleDone,
  onCostChange,
}: {
  activity: ItineraryActivity;
  onToggleDone: (done: boolean) => void | Promise<void>;
  onCostChange: (cost: number | null) => void | Promise<void>;
}) {
  const catalogCost = Number(activity.cost ?? 0);
  const initial =
    activity.custom_cost == null ? catalogCost : Number(activity.custom_cost);
  const [costText, setCostText] = useState(initial.toFixed(2));
  const [done, setDone] = useState(Boolean(activity.is_done));
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setDone(Boolean(activity.is_done));
  }, [activity.is_done]);

  useEffect(() => {
    const next =
      activity.custom_cost == null
        ? Number(activity.cost ?? 0)
        : Number(activity.custom_cost);
    setCostText(next.toFixed(2));
  }, [activity.custom_cost, activity.cost]);

  const timeLabel =
    [activity.start_time, activity.end_time].filter(Boolean).join(" – ") ||
    "Time TBD";

  async function commitCost() {
    const parsed = Number(costText);
    if (Number.isNaN(parsed) || parsed < 0) {
      setCostText(initial.toFixed(2));
      return;
    }
    if (parsed === initial) return;
    setSaving(true);
    try {
      await onCostChange(parsed);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div
      className={cn(
        "flex flex-wrap items-center gap-3 rounded-lg border border-border px-3 py-2.5",
        done && "bg-muted/40"
      )}
    >
      <Checkbox
        checked={done}
        disabled={saving}
        onCheckedChange={async (v) => {
          const next = Boolean(v);
          setDone(next);
          setSaving(true);
          try {
            await onToggleDone(next);
          } catch {
            setDone(!next);
          } finally {
            setSaving(false);
          }
        }}
        aria-label={`Mark ${activity.activity_name} done`}
      />
      <div className="min-w-0 flex-1">
        <p
          className={cn(
            "text-sm font-medium",
            done && "text-muted-foreground line-through"
          )}
        >
          {activity.activity_name}
        </p>
        <p className="text-xs text-muted-foreground">{timeLabel}</p>
      </div>
      <div className="flex items-center gap-2">
        <span className="text-xs text-muted-foreground">$</span>
        <Input
          type="number"
          min={0}
          step="0.01"
          className="h-8 w-24"
          value={costText}
          disabled={saving}
          onChange={(e) => setCostText(e.target.value)}
          onBlur={() => void commitCost()}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.currentTarget.blur();
            }
          }}
          aria-label={`Cost for ${activity.activity_name}`}
        />
        {activity.type ? (
          <Badge variant="outline" className="hidden sm:inline-flex">
            {activity.type}
          </Badge>
        ) : null}
      </div>
    </div>
  );
}
