import Link from "next/link";
import { DeleteTripButton } from "@/components/trips/delete-trip-button";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export type TripStatus = "ongoing" | "upcoming" | "completed";

export type TripListItem = {
  id: string;
  name: string;
  description: string | null;
  cover_photo: string | null;
  start_date: string;
  end_date: string;
  start_point: string | null;
  end_point: string | null;
  destination_count: number;
  status: TripStatus;
};

const STATUS_LABEL: Record<TripStatus, string> = {
  ongoing: "Ongoing",
  upcoming: "Upcoming",
  completed: "Completed",
};

function formatRange(start: string, end: string) {
  return `${String(start).slice(0, 10)} – ${String(end).slice(0, 10)}`;
}

export function TripListCard({ trip }: { trip: TripListItem }) {
  const destLabel =
    trip.destination_count === 1
      ? "1 destination"
      : `${trip.destination_count} destinations`;

  return (
    <article className="overflow-hidden rounded-xl border border-border bg-card">
      <div className="grid sm:grid-cols-[180px_1fr]">
        <div className="relative aspect-[16/10] bg-muted sm:aspect-auto sm:min-h-[140px]">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={trip.cover_photo || "/marketing/coast.jpg"}
            alt=""
            className="absolute inset-0 size-full object-cover"
          />
        </div>
        <div className="flex flex-col gap-3 p-4">
          <div className="flex flex-wrap items-start justify-between gap-2">
            <div>
              <h3 className="text-base font-semibold tracking-tight">
                {trip.name}
              </h3>
              <p className="text-sm text-muted-foreground">
                {formatRange(trip.start_date, trip.end_date)}
                {trip.start_point || trip.end_point
                  ? ` · ${[trip.start_point, trip.end_point].filter(Boolean).join(" → ")}`
                  : ""}
              </p>
            </div>
            <Badge
              variant={trip.status === "ongoing" ? "default" : "secondary"}
            >
              {STATUS_LABEL[trip.status]}
            </Badge>
          </div>
          {trip.description ? (
            <p className="line-clamp-2 text-sm text-muted-foreground">
              {trip.description}
            </p>
          ) : null}
          <Badge variant="outline" className="w-fit">
            {destLabel}
          </Badge>
          <div className="mt-auto flex flex-wrap gap-2">
            <Link
              href={`/trips/${trip.id}/itinerary`}
              className={cn(buttonVariants({ size: "sm" }))}
            >
              Open
            </Link>
            <Link
              href={`/trips/${trip.id}/builder`}
              className={cn(buttonVariants({ variant: "outline", size: "sm" }))}
            >
              Builder
            </Link>
            <Link
              href={`/trips/${trip.id}/edit`}
              className={cn(buttonVariants({ variant: "ghost", size: "sm" }))}
            >
              Edit
            </Link>
            <DeleteTripButton tripId={trip.id} tripName={trip.name} />
          </div>
        </div>
      </div>
    </article>
  );
}
