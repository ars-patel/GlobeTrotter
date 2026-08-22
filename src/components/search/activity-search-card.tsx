"use client";

import { AddActivityToTripButton } from "@/components/search/add-activity-to-trip-button";
import { RemoveTripActivityButton } from "@/components/search/remove-trip-activity-button";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Card,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";

export type ActivitySearchItem = {
  id: string;
  city_id: string;
  name: string;
  description: string | null;
  type: string;
  cost: string | number;
  duration_hrs: string | number | null;
  image_url: string | null;
  city_name: string;
  country: string;
  latitude: number | null;
  longitude: number | null;
};

export function ActivitySearchCard({
  activity,
  tripId,
  stopId,
  onTripActivityId,
}: {
  activity: ActivitySearchItem;
  tripId?: string;
  stopId?: string;
  /** If this catalog activity is already on the trip, enable Remove */
  onTripActivityId?: string;
}) {
  const mapUrl =
    activity.latitude != null && activity.longitude != null
      ? `https://www.openstreetmap.org/?mlat=${activity.latitude}&mlon=${activity.longitude}#map=14/${activity.latitude}/${activity.longitude}`
      : null;

  const duration =
    activity.duration_hrs == null
      ? null
      : `${Number(activity.duration_hrs)} hr${
          Number(activity.duration_hrs) === 1 ? "" : "s"
        }`;

  return (
    <Card className="overflow-hidden border-border shadow-sm transition hover:shadow-md">
      <div className="grid sm:grid-cols-[160px_1fr]">
        <div className="aspect-4/3 bg-muted sm:aspect-auto sm:min-h-[140px]">
          {activity.image_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={activity.image_url}
              alt=""
              className="size-full object-cover"
            />
          ) : (
            <div className="flex size-full min-h-[100px] items-center justify-center px-2 text-center text-xs text-muted-foreground">
              {activity.type}
            </div>
          )}
        </div>

        <div className="flex flex-col">
          <CardHeader className="gap-2">
            <CardTitle className="font-display text-lg font-bold tracking-tight">
              {activity.name}
            </CardTitle>
            <CardDescription>
              {activity.city_name}, {activity.country}
            </CardDescription>
            <p className="line-clamp-2 text-sm text-muted-foreground">
              {activity.description || "No description yet."}
            </p>
            <div className="flex flex-wrap gap-2">
              <Badge variant="secondary">{activity.type}</Badge>
              <Badge variant="outline">${Number(activity.cost).toFixed(2)}</Badge>
              {duration ? <Badge variant="outline">{duration}</Badge> : null}
            </div>
          </CardHeader>

          <CardFooter className="mt-auto flex flex-wrap gap-2">
            <Dialog>
              <DialogTrigger
                render={<Button type="button" size="sm" variant="outline" />}
              >
                Quick view
              </DialogTrigger>
              <DialogContent className="max-w-lg">
                <DialogHeader>
                  <DialogTitle>{activity.name}</DialogTitle>
                  <DialogDescription>
                    {activity.city_name}, {activity.country} · {activity.type}
                  </DialogDescription>
                </DialogHeader>
                {activity.image_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={activity.image_url}
                    alt={activity.name}
                    className="max-h-56 w-full rounded-lg object-cover"
                  />
                ) : null}
                <p className="text-sm leading-relaxed text-muted-foreground">
                  {activity.description || "No description available."}
                </p>
                <div className="flex flex-wrap gap-2">
                  <Badge variant="outline">
                    ${Number(activity.cost).toFixed(2)}
                  </Badge>
                  {duration ? (
                    <Badge variant="outline">{duration}</Badge>
                  ) : null}
                </div>
              </DialogContent>
            </Dialog>

            {mapUrl ? (
              <a
                href={mapUrl}
                target="_blank"
                rel="noreferrer"
                className={cn(buttonVariants({ variant: "outline", size: "sm" }))}
              >
                View Map
              </a>
            ) : null}

            {onTripActivityId && tripId && stopId ? (
              <RemoveTripActivityButton
                tripId={tripId}
                stopId={stopId}
                tripActivityId={onTripActivityId}
              />
            ) : (
              <AddActivityToTripButton
                activityId={activity.id}
                activityName={activity.name}
                cityId={activity.city_id}
                preferredTripId={tripId}
                preferredStopId={stopId}
              />
            )}
          </CardFooter>
        </div>
      </div>
    </Card>
  );
}
