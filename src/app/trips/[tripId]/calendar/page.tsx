import { redirect, notFound } from "next/navigation";
import { AppHeader } from "@/components/layout/app-header";
import { TripSubNav } from "@/components/trips/trip-sub-nav";
import { getCurrentUser } from "@/lib/auth/session";
import { getOwnedTrip, getTripItinerary } from "@/lib/trips/queries";

type Props = { params: Promise<{ tripId: string }> };

export default async function TripCalendarPage({ params }: Props) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  const { tripId } = await params;
  const trip = await getOwnedTrip(tripId, user.id);
  if (!trip) notFound();
  const { activities } = await getTripItinerary(tripId);

  const byDay = new Map<string, typeof activities>();
  for (const a of activities) {
    const key = String(a.day_date).slice(0, 10);
    if (!byDay.has(key)) byDay.set(key, []);
    byDay.get(key)!.push(a);
  }

  return (
    <div className="flex min-h-full flex-1 flex-col">
      <AppHeader user={user} />
      <main className="mx-auto w-full max-w-3xl flex-1 space-y-6 px-6 py-8">
        <TripSubNav tripId={tripId} active="calendar" />
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Trip calendar</h1>
          <p className="text-sm text-muted-foreground">
            Day-wise timeline for {trip.name}
          </p>
        </div>
        <div className="space-y-4">
          {[...byDay.entries()].sort(([a], [b]) => a.localeCompare(b)).map(([day, items]) => (
            <section key={day} className="rounded-lg border border-border p-4">
              <h2 className="text-sm font-semibold">{day}</h2>
              <ul className="mt-2 space-y-1 text-sm">
                {items.map((a) => (
                  <li key={a.id}>
                    {a.start_time ? `${a.start_time} · ` : ""}
                    {a.activity_name}
                  </li>
                ))}
              </ul>
            </section>
          ))}
          {byDay.size === 0 ? (
            <p className="text-sm text-muted-foreground">
              No scheduled activities yet. Add some in the builder.
            </p>
          ) : null}
        </div>
      </main>
    </div>
  );
}
