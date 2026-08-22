import { redirect } from "next/navigation";
import Link from "next/link";
import { AppHeader } from "@/components/layout/app-header";
import { CitySearchCard } from "@/components/search/city-search-card";
import {
  ActivitySearchCard,
  type ActivitySearchItem,
} from "@/components/search/activity-search-card";
import { buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { NativeSelect, NativeSelectOption } from "@/components/ui/native-select";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyTitle,
} from "@/components/ui/empty";
import { getCurrentUser } from "@/lib/auth/session";
import { query } from "@/lib/db";
import { getOwnedTrip, getTripItinerary } from "@/lib/trips/queries";
import { cn } from "@/lib/utils";

type Props = {
  searchParams: Promise<{
    q?: string;
    type?: string;
    country?: string;
    region?: string;
    sort?: string;
    tripId?: string;
    stopId?: string;
    cityId?: string;
    activityType?: string;
    maxCost?: string;
    maxDuration?: string;
  }>;
};

export default async function SearchPage({ searchParams }: Props) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  const sp = await searchParams;
  const q = sp.q?.trim() ?? "";
  const type = sp.type === "activity" ? "activity" : "city";
  const country = sp.country?.trim() ?? "";
  const region = sp.region?.trim() ?? "";
  const sort =
    sp.sort === "name" || sp.sort === "cost_index" ? sp.sort : "popularity";
  const tripId = sp.tripId?.trim();
  const stopId = sp.stopId?.trim();
  const cityId = sp.cityId?.trim() ?? "";
  const activityType = sp.activityType?.trim() ?? "";
  const maxCost = sp.maxCost?.trim() ?? "";
  const maxDuration = sp.maxDuration?.trim() ?? "";

  const countries = await query<{ country: string }>(
    `SELECT DISTINCT country FROM cities ORDER BY country ASC`
  );

  const regionParams: unknown[] = [];
  let regionSql = `SELECT DISTINCT region FROM cities WHERE region IS NOT NULL AND TRIM(region) <> ''`;
  if (country) {
    regionParams.push(country);
    regionSql += ` AND country = $1`;
  }
  regionSql += ` ORDER BY region ASC`;
  const regions = await query<{ region: string }>(regionSql, regionParams);

  const activityTypes = await query<{ type: string }>(
    `SELECT DISTINCT type::text AS type FROM activities ORDER BY type ASC`
  );

  const citiesCatalog = await query<{ id: string; name: string; country: string }>(
    `SELECT id, name, country FROM cities ORDER BY name ASC`
  );

  let cities: Array<{
    id: string;
    name: string;
    country: string;
    region: string | null;
    cost_index: string | number;
    popularity: number;
  }> = [];
  let activities: ActivitySearchItem[] = [];

  const onTripByActivityId = new Map<
    string,
    { tripActivityId: string; stopId: string }
  >();

  if (tripId) {
    const trip = await getOwnedTrip(tripId, user.id);
    if (trip) {
      const itin = await getTripItinerary(tripId);
      for (const a of itin.activities) {
        onTripByActivityId.set(String(a.activity_id), {
          tripActivityId: String(a.id),
          stopId: String(a.stop_id),
        });
      }
    }
  }

  if (type === "city") {
    const clauses: string[] = [];
    const params: unknown[] = [];
    if (q) {
      params.push(`%${q}%`);
      clauses.push(
        `(name ILIKE $${params.length} OR country ILIKE $${params.length} OR COALESCE(region,'') ILIKE $${params.length})`
      );
    }
    if (country) {
      params.push(country);
      clauses.push(`country = $${params.length}`);
    }
    if (region) {
      params.push(region);
      clauses.push(`region = $${params.length}`);
    }
    const where = clauses.length ? `WHERE ${clauses.join(" AND ")}` : "";
    const order =
      sort === "name"
        ? "name ASC"
        : sort === "cost_index"
          ? "cost_index ASC, name ASC"
          : "popularity DESC, name ASC";
    const res = await query(
      `SELECT id, name, country, region, cost_index, popularity, image_url
       FROM cities ${where}
       ORDER BY ${order}
       LIMIT 50`,
      params
    );
    cities = res.rows as typeof cities;
  } else {
    const params: unknown[] = [];
    const clauses: string[] = [];
    if (q) {
      params.push(`%${q}%`);
      clauses.push(
        `(a.name ILIKE $${params.length} OR a.description ILIKE $${params.length} OR c.name ILIKE $${params.length})`
      );
    }
    if (country) {
      params.push(country);
      clauses.push(`c.country = $${params.length}`);
    }
    if (cityId) {
      params.push(cityId);
      clauses.push(`a.city_id = $${params.length}`);
    }
    if (activityType) {
      params.push(activityType);
      clauses.push(`a.type = $${params.length}`);
    }
    if (maxCost !== "" && !Number.isNaN(Number(maxCost))) {
      params.push(Number(maxCost));
      clauses.push(`a.cost <= $${params.length}`);
    }
    if (maxDuration !== "" && !Number.isNaN(Number(maxDuration))) {
      params.push(Number(maxDuration));
      clauses.push(`a.duration_hrs <= $${params.length}`);
    }
    const where = clauses.length ? `WHERE ${clauses.join(" AND ")}` : "";
    const res = await query(
      `SELECT a.id, a.city_id, a.name, a.description, a.type, a.cost, a.duration_hrs, a.image_url,
              c.name AS city_name, c.country, c.latitude, c.longitude
       FROM activities a
       JOIN cities c ON c.id = a.city_id
       ${where}
       ORDER BY a.cost ASC, a.name ASC
       LIMIT 50`,
      params
    );
    activities = res.rows as ActivitySearchItem[];
  }

  return (
    <div className="flex min-h-full flex-1 flex-col">
      <AppHeader user={user} />
      <main className="mx-auto w-full max-w-3xl flex-1 space-y-6 px-6 py-8">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">
            {type === "city" ? "City search" : "Activity search"}
          </h1>
          <p className="text-sm text-muted-foreground">
            {type === "city"
              ? "Find destinations by name, country, or region — then add them to a trip."
              : "Filter by interest, cost, and duration — then add experiences to a stop."}
          </p>
        </div>

        <form
          method="get"
          className="space-y-3 rounded-xl border border-border p-4"
        >
          {tripId ? <input type="hidden" name="tripId" value={tripId} /> : null}
          {stopId ? <input type="hidden" name="stopId" value={stopId} /> : null}

          <div className="space-y-2">
            <Label htmlFor="q">Search</Label>
            <Input
              id="q"
              name="q"
              defaultValue={q}
              placeholder={
                type === "city"
                  ? "City, country, or region…"
                  : "Activity or city name…"
              }
            />
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="type">Looking for</Label>
              <NativeSelect
                id="type"
                name="type"
                className="w-full"
                defaultValue={type}
              >
                <NativeSelectOption value="city">Cities</NativeSelectOption>
                <NativeSelectOption value="activity">Activities</NativeSelectOption>
              </NativeSelect>
            </div>
            <div className="space-y-2">
              <Label htmlFor="country">Country</Label>
              <NativeSelect
                id="country"
                name="country"
                className="w-full"
                defaultValue={country}
              >
                <NativeSelectOption value="">All countries</NativeSelectOption>
                {countries.rows.map((c) => (
                  <NativeSelectOption key={c.country} value={c.country}>
                    {c.country}
                  </NativeSelectOption>
                ))}
              </NativeSelect>
            </div>

            {type === "city" ? (
              <>
                <div className="space-y-2">
                  <Label htmlFor="region">Region</Label>
                  <NativeSelect
                    id="region"
                    name="region"
                    className="w-full"
                    defaultValue={region}
                  >
                    <NativeSelectOption value="">All regions</NativeSelectOption>
                    {regions.rows.map((r) => (
                      <NativeSelectOption key={r.region} value={r.region}>
                        {r.region}
                      </NativeSelectOption>
                    ))}
                  </NativeSelect>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="sort">Sort by</Label>
                  <NativeSelect
                    id="sort"
                    name="sort"
                    className="w-full"
                    defaultValue={sort}
                  >
                    <NativeSelectOption value="popularity">
                      Popularity
                    </NativeSelectOption>
                    <NativeSelectOption value="cost_index">
                      Cost index
                    </NativeSelectOption>
                    <NativeSelectOption value="name">Name</NativeSelectOption>
                  </NativeSelect>
                </div>
              </>
            ) : (
              <>
                <div className="space-y-2">
                  <Label htmlFor="activityType">Interest / type</Label>
                  <NativeSelect
                    id="activityType"
                    name="activityType"
                    className="w-full"
                    defaultValue={activityType}
                  >
                    <NativeSelectOption value="">All types</NativeSelectOption>
                    {activityTypes.rows.map((t) => (
                      <NativeSelectOption key={t.type} value={t.type}>
                        {t.type}
                      </NativeSelectOption>
                    ))}
                  </NativeSelect>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="cityId">City</Label>
                  <NativeSelect
                    id="cityId"
                    name="cityId"
                    className="w-full"
                    defaultValue={cityId}
                  >
                    <NativeSelectOption value="">All cities</NativeSelectOption>
                    {citiesCatalog.rows.map((c) => (
                      <NativeSelectOption key={c.id} value={c.id}>
                        {c.name}, {c.country}
                      </NativeSelectOption>
                    ))}
                  </NativeSelect>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="maxCost">Max cost ($)</Label>
                  <Input
                    id="maxCost"
                    name="maxCost"
                    type="number"
                    min={0}
                    step="1"
                    defaultValue={maxCost}
                    placeholder="Any"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="maxDuration">Max duration (hrs)</Label>
                  <Input
                    id="maxDuration"
                    name="maxDuration"
                    type="number"
                    min={0}
                    step="0.5"
                    defaultValue={maxDuration}
                    placeholder="Any"
                  />
                </div>
              </>
            )}
          </div>

          <div className="flex flex-wrap gap-2">
            <button type="submit" className={cn(buttonVariants())}>
              Search
            </button>
            <Link
              href={
                tripId
                  ? `/search?type=${type}&tripId=${encodeURIComponent(tripId)}${
                      stopId ? `&stopId=${encodeURIComponent(stopId)}` : ""
                    }`
                  : `/search?type=${type}`
              }
              className={cn(buttonVariants({ variant: "outline" }))}
            >
              Clear filters
            </Link>
          </div>
        </form>

        {type === "city" ? (
          cities.length === 0 ? (
            <Empty className="border border-dashed">
              <EmptyHeader>
                <EmptyTitle>No cities match</EmptyTitle>
                <EmptyDescription>
                  Try another query, country, or region filter.
                </EmptyDescription>
              </EmptyHeader>
            </Empty>
          ) : (
            <div className="space-y-3">
              <p className="text-sm text-muted-foreground">
                {cities.length} destination{cities.length === 1 ? "" : "s"}
              </p>
              {cities.map((city) => (
                <CitySearchCard key={city.id} city={city} tripId={tripId} />
              ))}
            </div>
          )
        ) : activities.length === 0 ? (
          <Empty className="border border-dashed">
            <EmptyHeader>
              <EmptyTitle>No activities match</EmptyTitle>
              <EmptyDescription>
                Try another type, cost, duration, or city filter.
              </EmptyDescription>
            </EmptyHeader>
          </Empty>
        ) : (
          <div className="space-y-3">
            <p className="text-sm text-muted-foreground">
              {activities.length} activit
              {activities.length === 1 ? "y" : "ies"}
            </p>
            {activities.map((a) => {
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
                  stopId={onTrip?.stopId ?? stopId}
                  onTripActivityId={onTrip?.tripActivityId}
                />
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
