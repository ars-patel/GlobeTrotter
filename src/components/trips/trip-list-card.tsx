import Link from "next/link";
import { DeleteTripButton } from "@/components/trips/delete-trip-button";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import {
  Card,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";

export type TripListItem = {
  id: string;
  name: string;
  description: string | null;
  start_date: string;
  end_date: string;
  start_point: string | null;
  end_point: string | null;
  destination_count: number;
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
    <Card className="border-border shadow-none">
      <CardHeader className="gap-2">
        <CardTitle className="text-base">{trip.name}</CardTitle>
        <CardDescription>
          {formatRange(trip.start_date, trip.end_date)}
          {trip.start_point || trip.end_point
            ? ` · ${[trip.start_point, trip.end_point].filter(Boolean).join(" → ")}`
            : ""}
        </CardDescription>
        {trip.description ? (
          <p className="line-clamp-2 text-sm text-muted-foreground">
            {trip.description}
          </p>
        ) : null}
        <Badge variant="secondary" className="w-fit">
          {destLabel}
        </Badge>
      </CardHeader>
      <CardFooter className="flex flex-wrap gap-2">
        <Link
          href={`/trips/${trip.id}/itinerary`}
          className={cn(buttonVariants({ size: "sm" }))}
        >
          View
        </Link>
        <Link
          href={`/trips/${trip.id}/edit`}
          className={cn(buttonVariants({ variant: "outline", size: "sm" }))}
        >
          Edit
        </Link>
        <DeleteTripButton tripId={trip.id} tripName={trip.name} />
      </CardFooter>
    </Card>
  );
}
