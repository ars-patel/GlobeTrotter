"use client";

import { GripVerticalIcon, PencilIcon, ChevronDownIcon, ChevronUpIcon } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { TimelineActivity } from "@/components/trips/trip-calendar-timeline";

export function TimelineActivityRow({
  activity,
  cityLabel,
  index,
  total,
  busy,
  onEdit,
  onMove,
  onDragStart,
  onDragOver,
  onDrop,
}: {
  activity: TimelineActivity;
  cityLabel?: string;
  index: number;
  total: number;
  busy: boolean;
  onEdit: () => void;
  onMove: (direction: -1 | 1) => void;
  onDragStart: () => void;
  onDragOver: (e: React.DragEvent) => void;
  onDrop: () => void;
}) {
  const timeLabel =
    [activity.start_time, activity.end_time]
      .filter(Boolean)
      .map((t) => String(t).slice(0, 5))
      .join(" – ") || "Time TBD";
  const cost =
    activity.custom_cost == null
      ? Number(activity.cost ?? 0)
      : Number(activity.custom_cost);

  return (
    <div
      draggable={!busy}
      onDragStart={onDragStart}
      onDragOver={onDragOver}
      onDrop={(e) => {
        e.preventDefault();
        onDrop();
      }}
      className={cn(
        "flex items-start gap-2 rounded-lg border border-border bg-background px-2 py-2",
        activity.is_done && "bg-muted/40",
        busy && "opacity-60"
      )}
    >
      <button
        type="button"
        className="mt-1 cursor-grab touch-none text-muted-foreground active:cursor-grabbing"
        aria-label="Drag to reorder"
        tabIndex={-1}
      >
        <GripVerticalIcon className="size-4" />
      </button>

      <div className="min-w-0 flex-1 space-y-0.5">
        {cityLabel ? (
          <p className="text-[11px] font-medium tracking-wide text-muted-foreground uppercase">
            {cityLabel}
          </p>
        ) : null}
        <p
          className={cn(
            "text-sm font-medium",
            activity.is_done && "text-muted-foreground line-through"
          )}
        >
          {activity.activity_name}
        </p>
        <p className="text-xs text-muted-foreground">
          {timeLabel} · ${cost.toFixed(2)}
        </p>
        {activity.notes ? (
          <p className="line-clamp-2 text-xs text-muted-foreground">
            {activity.notes}
          </p>
        ) : null}
        {activity.type ? (
          <Badge variant="outline" className="mt-1">
            {activity.type}
          </Badge>
        ) : null}
      </div>

      <div className="flex shrink-0 flex-col gap-0.5">
        <Button
          type="button"
          size="icon-sm"
          variant="ghost"
          disabled={busy || index === 0}
          onClick={() => onMove(-1)}
          aria-label="Move up"
        >
          <ChevronUpIcon />
        </Button>
        <Button
          type="button"
          size="icon-sm"
          variant="ghost"
          disabled={busy || index >= total - 1}
          onClick={() => onMove(1)}
          aria-label="Move down"
        >
          <ChevronDownIcon />
        </Button>
        <Button
          type="button"
          size="icon-sm"
          variant="ghost"
          disabled={busy}
          onClick={onEdit}
          aria-label="Quick edit"
        >
          <PencilIcon />
        </Button>
      </div>
    </div>
  );
}
