import { redirect, notFound } from "next/navigation";
import { AppHeader } from "@/components/layout/app-header";
import { TripSubNav } from "@/components/trips/trip-sub-nav";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyTitle,
} from "@/components/ui/empty";
import { getCurrentUser } from "@/lib/auth/session";
import { getOwnedTrip, getTripItinerary } from "@/lib/trips/queries";
import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type Props = { params: Promise<{ tripId: string }> };

export default async function ItineraryViewPage({ params }: Props) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  const { tripId } = await params;
  const trip = await getOwnedTrip(tripId, user.id);
  if (!trip) notFound();

  const { stops, activities } = await getTripItinerary(tripId);

  const days = new Map<string, typeof activities>();
  for (const a of activities) {
    const key = String(a.day_date).slice(0, 10);
    if (!days.has(key)) days.set(key, []);
    days.get(key)!.push(a);
  }
  const dayKeys = [...days.keys()].sort();

  return (
    <div className="flex min-h-full flex-1 flex-col">
      <AppHeader user={user} />
      <main className="mx-auto w-full max-w-3xl flex-1 space-y-6 px-6 py-8">
        <TripSubNav tripId={tripId} active="itinerary" />
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">{trip.name}</h1>
          <p className="text-sm text-muted-foreground">
            Itinerary list of selected places
          </p>
        </div>

        {stops.length === 0 ? (
          <Empty className="border border-dashed">
            <EmptyHeader>
              <EmptyTitle>No stops yet</EmptyTitle>
              <EmptyDescription>Open the builder to add cities and activities.</EmptyDescription>
            </EmptyHeader>
            <Link href={`/trips/${tripId}/builder`} className={cn(buttonVariants())}>
              Open Builder
            </Link>
          </Empty>
        ) : (
          <div className="space-y-8">
            {stops.map((s) => (
              <section key={s.id} className="space-y-3">
                <h2 className="text-lg font-semibold">
                  {s.city_name}
                  <span className="ml-2 text-sm font-normal text-muted-foreground">
                    {String(s.start_date).slice(0, 10)} – {String(s.end_date).slice(0, 10)}
                  </span>
                </h2>
                <Separator />
                {dayKeys
                  .filter((d) =>
                    activities.some(
                      (a) => a.stop_id === s.id && String(a.day_date).slice(0, 10) === d
                    )
                  )
                  .map((day, idx) => (
                    <div key={day} className="space-y-2">
                      <h3 className="text-sm font-medium">
                        Day {idx + 1} · {day}
                      </h3>
                      <ul className="space-y-2">
                        {activities
                          .filter(
                            (a) =>
                              a.stop_id === s.id &&
                              String(a.day_date).slice(0, 10) === day
                          )
                          .map((a) => {
                            const cost = Number(a.custom_cost ?? a.cost ?? 0);
                            return (
                              <li
                                key={a.id}
                                className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-border px-3 py-2 text-sm"
                              >
                                <div>
                                  <p className="font-medium">{a.activity_name}</p>
                                  <p className="text-xs text-muted-foreground">
                                    {[a.start_time, a.end_time].filter(Boolean).join(" – ") ||
                                      "Time TBD"}
                                  </p>
                                </div>
                                <Badge variant="outline">${cost.toFixed(2)}</Badge>
                              </li>
                            );
                          })}
                      </ul>
                    </div>
                  ))}
              </section>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
