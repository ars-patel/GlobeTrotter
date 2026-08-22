import { redirect, notFound } from "next/navigation";
import { AppHeader } from "@/components/layout/app-header";
import { TripSubNav } from "@/components/trips/trip-sub-nav";
import { TripCalendarTimeline } from "@/components/trips/trip-calendar-timeline";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyTitle,
} from "@/components/ui/empty";
import { buttonVariants } from "@/components/ui/button";
import Link from "next/link";
import { getCurrentUser } from "@/lib/auth/session";
import { getOwnedTrip, getTripItinerary } from "@/lib/trips/queries";
import { toDateString } from "@/lib/dates";
import { cn } from "@/lib/utils";

type Props = { params: Promise<{ tripId: string }> };

export default async function TripCalendarPage({ params }: Props) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  const { tripId } = await params;
  const trip = await getOwnedTrip(tripId, user.id);
  if (!trip) notFound();

  const { stops, activities } = await getTripItinerary(tripId);

  return (
    <div className="flex min-h-full flex-1 flex-col">
      <AppHeader user={user} />
      <main className="mx-auto w-full max-w-5xl flex-1 space-y-6 px-6 py-8">
        <TripSubNav tripId={tripId} active="calendar" />

        {stops.length === 0 ? (
          <Empty className="border border-dashed">
            <EmptyHeader>
              <EmptyTitle>No itinerary to schedule</EmptyTitle>
              <EmptyDescription>
                Add cities and activities in the builder, then visualize them on
                the calendar timeline.
              </EmptyDescription>
            </EmptyHeader>
            <Link
              href={`/trips/${tripId}/builder`}
              className={cn(buttonVariants())}
            >
              Open Builder
            </Link>
          </Empty>
        ) : (
          <TripCalendarTimeline
            tripId={tripId}
            tripName={String(trip.name)}
            tripStart={toDateString(trip.start_date)}
            tripEnd={toDateString(trip.end_date)}
            stops={stops.map((s) => ({
              id: String(s.id),
              city_name: String(s.city_name),
              country: String(s.country ?? ""),
              start_date: toDateString(s.start_date),
              end_date: toDateString(s.end_date),
              stop_order: Number(s.stop_order),
            }))}
            activities={activities.map((a) => ({
              id: String(a.id),
              stop_id: String(a.stop_id),
              activity_name: String(a.activity_name),
              day_date: toDateString(a.day_date),
              start_time: a.start_time ? String(a.start_time) : null,
              end_time: a.end_time ? String(a.end_time) : null,
              act_order: Number(a.act_order ?? 0),
              notes: a.notes != null ? String(a.notes) : null,
              cost: a.cost as string | number | null,
              custom_cost: a.custom_cost as string | number | null,
              is_done: Boolean(a.is_done),
              type: a.type ? String(a.type) : undefined,
            }))}
          />
        )}
      </main>
    </div>
  );
}
