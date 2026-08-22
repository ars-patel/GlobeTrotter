import { redirect, notFound } from "next/navigation";
import { AppShell } from "@/components/layout/app-header";
import { TripSubNav } from "@/components/trips/trip-sub-nav";
import {
  ActivitySearchCard,
  type ActivitySearchItem,
} from "@/components/search/activity-search-card";
import { buttonVariants } from "@/components/ui/button";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyTitle,
} from "@/components/ui/empty";
import { NativeSelect, NativeSelectOption } from "@/components/ui/native-select";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import { getCurrentUser } from "@/lib/auth/session";
import { getOwnedTrip, getTripItinerary } from "@/lib/trips/queries";
import { query } from "@/lib/db";
import { cn } from "@/lib/utils";

type Props = {
  params: Promise<{ tripId: string }>;
  searchParams: Promise<{
    stopId?: string;
    activityType?: string;
    maxCost?: string;
    maxDuration?: string;
    q?: string;
  }>;
};

export default async function TripActivitiesPage({
  params,
  searchParams,
}: Props) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  const { tripId } = await params;
  const sp = await searchParams;
  const trip = await getOwnedTrip(tripId, user.id);
  if (!trip) notFound();

  const { stops, activities: tripActs } = await getTripItinerary(tripId);
  const stopId = sp.stopId?.trim() || String(stops[0]?.id ?? "");
  const selectedStop = stops.find((s) => String(s.id) === stopId) ?? stops[0];
  const activityType = sp.activityType?.trim() ?? "";
  const maxCost = sp.maxCost?.trim() ?? "";
  const maxDuration = sp.maxDuration?.trim() ?? "";
  const q = sp.q?.trim() ?? "";

  const types = await query<{ type: string }>(
    `SELECT DISTINCT type::text AS type FROM activities ORDER BY type ASC`
  );

  const onTripByActivityId = new Map<
    string,
    { tripActivityId: string; stopId: string }
  >();
  for (const a of tripActs) {
    onTripByActivityId.set(String(a.activity_id), {
      tripActivityId: String(a.id),
      stopId: String(a.stop_id),
    });
  }

  let catalog: ActivitySearchItem[] = [];
  if (selectedStop) {
    const clauses = [`a.city_id = $1`];
    const paramsArr: unknown[] = [selectedStop.city_id];
    if (q) {
      paramsArr.push(`%${q}%`);
      clauses.push(
        `(a.name ILIKE $${paramsArr.length} OR a.description ILIKE $${paramsArr.length})`
      );
    }
    if (activityType) {
      paramsArr.push(activityType);
      clauses.push(`a.type = $${paramsArr.length}`);
    }
    if (maxCost !== "" && !Number.isNaN(Number(maxCost))) {
      paramsArr.push(Number(maxCost));
      clauses.push(`a.cost <= $${paramsArr.length}`);
    }
    if (maxDuration !== "" && !Number.isNaN(Number(maxDuration))) {
      paramsArr.push(Number(maxDuration));
      clauses.push(`a.duration_hrs <= $${paramsArr.length}`);
    }
    const res = await query(
      `SELECT a.id, a.city_id, a.name, a.description, a.type, a.cost, a.duration_hrs, a.image_url,
              c.name AS city_name, c.country, c.latitude, c.longitude
       FROM activities a
       JOIN cities c ON c.id = a.city_id
       WHERE ${clauses.join(" AND ")}
       ORDER BY a.cost ASC, a.name ASC
       LIMIT 50`,
      paramsArr
    );
    catalog = res.rows as ActivitySearchItem[];
  }

  return (
    <AppShell user={user}>
      <main className="mx-auto w-full max-w-3xl flex-1 space-y-6 px-6 py-8">
        <TripSubNav tripId={tripId} active="builder" />
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">
              Add activity
            </h1>
            <p className="text-sm text-muted-foreground">
              {trip.name} — browse catalog options for a stop
            </p>
          </div>
          <Link
            href={`/trips/${tripId}/builder`}
            className={cn(buttonVariants({ variant: "outline", size: "sm" }))}
          >
            Back to builder
          </Link>
        </div>

        {stops.length === 0 ? (
          <Empty className="border border-dashed">
            <EmptyHeader>
              <EmptyTitle>No stops yet</EmptyTitle>
              <EmptyDescription>
                Add a city stop in the builder before assigning activities.
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
          <>
            <form
              method="get"
              className="grid gap-3 rounded-xl border border-border p-4 sm:grid-cols-2"
            >
              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor="stopId">Stop</Label>
                <NativeSelect
                  id="stopId"
                  name="stopId"
                  className="w-full"
                  defaultValue={String(selectedStop?.id ?? "")}
                >
                  {stops.map((s) => (
                    <NativeSelectOption key={String(s.id)} value={String(s.id)}>
                      {String(s.city_name)}
                    </NativeSelectOption>
                  ))}
                </NativeSelect>
              </div>
              <div className="space-y-2">
                <Label htmlFor="q">Search</Label>
                <Input id="q" name="q" defaultValue={q} placeholder="Name…" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="activityType">Type</Label>
                <NativeSelect
                  id="activityType"
                  name="activityType"
                  className="w-full"
                  defaultValue={activityType}
                >
                  <NativeSelectOption value="">All types</NativeSelectOption>
                  {types.rows.map((t) => (
                    <NativeSelectOption key={t.type} value={t.type}>
                      {t.type}
                    </NativeSelectOption>
                  ))}
                </NativeSelect>
              </div>
              <div className="space-y-2">
                <Label htmlFor="maxCost">Max cost</Label>
                <Input
                  id="maxCost"
                  name="maxCost"
                  type="number"
                  min={0}
                  defaultValue={maxCost}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="maxDuration">Max hours</Label>
                <Input
                  id="maxDuration"
                  name="maxDuration"
                  type="number"
                  min={0}
                  step="0.5"
                  defaultValue={maxDuration}
                />
              </div>
              <button type="submit" className={cn(buttonVariants(), "sm:col-span-2")}>
                Apply filters
              </button>
            </form>

            <div className="space-y-3">
              {catalog.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  No catalog activities for this city with the current filters.
                </p>
              ) : (
                catalog.map((a) => {
                  const onTrip = onTripByActivityId.get(a.id);
                  return (
                    <ActivitySearchCard
                      key={a.id}
                      activity={{
                        ...a,
                        latitude:
                          a.latitude == null ? null : Number(a.latitude),
                        longitude:
                          a.longitude == null ? null : Number(a.longitude),
                      }}
                      tripId={tripId}
                      stopId={
                        onTrip?.stopId ?? String(selectedStop?.id ?? "")
                      }
                      onTripActivityId={onTrip?.tripActivityId}
                    />
                  );
                })
              )}
            </div>

            <Link
              href={`/trips/${tripId}/activities?stopId=${encodeURIComponent(String(selectedStop?.id ?? ""))}`}
              className={cn(buttonVariants({ variant: "secondary" }))}
            >
              + Add another activity
            </Link>
          </>
        )}
      </main>
    </AppShell>
  );
}
