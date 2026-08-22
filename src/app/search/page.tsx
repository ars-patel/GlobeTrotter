import { redirect } from "next/navigation";
import Link from "next/link";
import { AppHeader } from "@/components/layout/app-header";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import {
  Card,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyTitle,
} from "@/components/ui/empty";
import { getCurrentUser } from "@/lib/auth/session";
import { query } from "@/lib/db";
import { cn } from "@/lib/utils";

type Props = { searchParams: Promise<{ q?: string; type?: string; country?: string }> };

export default async function SearchPage({ searchParams }: Props) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  const sp = await searchParams;
  const q = sp.q?.trim() ?? "";
  const type = sp.type === "activity" ? "activity" : "city";
  const country = sp.country?.trim();

  const countries = await query<{ country: string }>(
    `SELECT DISTINCT country FROM cities ORDER BY country ASC`
  );

  let cities: Array<Record<string, unknown>> = [];
  let activities: Array<Record<string, unknown>> = [];

  if (type === "city") {
    const clauses: string[] = [];
    const params: unknown[] = [];
    if (q) {
      params.push(`%${q}%`);
      clauses.push(`(name ILIKE $1 OR country ILIKE $1)`);
    }
    if (country) {
      params.push(country);
      clauses.push(`country = $${params.length}`);
    }
    const where = clauses.length ? `WHERE ${clauses.join(" AND ")}` : "";
    const res = await query(
      `SELECT id, name, country, region, cost_index, popularity, image_url
       FROM cities ${where}
       ORDER BY popularity DESC LIMIT 50`,
      params
    );
    cities = res.rows;
  } else {
    const params: unknown[] = [];
    const clauses: string[] = [];
    if (q) {
      params.push(`%${q}%`);
      clauses.push(`(a.name ILIKE $1 OR a.description ILIKE $1)`);
    }
    const where = clauses.length ? `WHERE ${clauses.join(" AND ")}` : "";
    const res = await query(
      `SELECT a.id, a.name, a.description, a.type, a.cost, a.duration_hrs,
              c.name AS city_name, c.country, c.latitude, c.longitude
       FROM activities a
       JOIN cities c ON c.id = a.city_id
       ${where}
       ORDER BY a.name ASC LIMIT 50`,
      params
    );
    activities = res.rows;
  }

  return (
    <div className="flex min-h-full flex-1 flex-col">
      <AppHeader user={user} />
      <main className="mx-auto w-full max-w-3xl flex-1 space-y-6 px-6 py-8">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Search</h1>
          <p className="text-sm text-muted-foreground">
            Discover cities and activities from the live database
          </p>
        </div>

        <form className="flex flex-col gap-3 sm:flex-row">
          <Input name="q" defaultValue={q} placeholder="Search…" className="flex-1" />
          <select
            name="type"
            defaultValue={type}
            className="flex h-8 rounded-lg border border-input bg-transparent px-2.5 text-sm"
          >
            <option value="city">Cities</option>
            <option value="activity">Activities</option>
          </select>
          <select
            name="country"
            defaultValue={country ?? ""}
            className="flex h-8 rounded-lg border border-input bg-transparent px-2.5 text-sm"
          >
            <option value="">All countries</option>
            {countries.rows.map((c) => (
              <option key={c.country} value={c.country}>
                {c.country}
              </option>
            ))}
          </select>
          <button type="submit" className={cn(buttonVariants())}>
            Search
          </button>
        </form>

        {type === "city" ? (
          cities.length === 0 ? (
            <Empty className="border border-dashed">
              <EmptyHeader>
                <EmptyTitle>No cities match</EmptyTitle>
                <EmptyDescription>Try another query or country filter.</EmptyDescription>
              </EmptyHeader>
            </Empty>
          ) : (
            <div className="space-y-3">
              {cities.map((city) => (
                <Card key={String(city.id)} className="border-border shadow-none">
                  <CardHeader className="gap-2">
                    <CardTitle className="text-base">{String(city.name)}</CardTitle>
                    <CardDescription>
                      {String(city.country)}
                      {city.region ? ` · ${String(city.region)}` : ""}
                    </CardDescription>
                    <div className="flex gap-2">
                      <Badge variant="secondary">Pop {String(city.popularity)}</Badge>
                      <Badge variant="outline">
                        Cost ×{Number(city.cost_index).toFixed(2)}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardFooter>
                    <Link
                      href={`/activities?cityId=${city.id}`}
                      className={cn(buttonVariants({ size: "sm" }))}
                    >
                      View activities
                    </Link>
                  </CardFooter>
                </Card>
              ))}
            </div>
          )
        ) : activities.length === 0 ? (
          <Empty className="border border-dashed">
            <EmptyHeader>
              <EmptyTitle>No activities match</EmptyTitle>
              <EmptyDescription>Try another search term.</EmptyDescription>
            </EmptyHeader>
          </Empty>
        ) : (
          <div className="space-y-3">
            {activities.map((a) => {
              const lat = a.latitude as number | null;
              const lng = a.longitude as number | null;
              const mapUrl =
                lat != null && lng != null
                  ? `https://www.openstreetmap.org/?mlat=${lat}&mlon=${lng}#map=14/${lat}/${lng}`
                  : null;
              return (
                <Card key={String(a.id)} className="border-border shadow-none">
                  <CardHeader className="gap-2">
                    <CardTitle className="text-base">{String(a.name)}</CardTitle>
                    <CardDescription>
                      {String(a.city_name)}, {String(a.country)} · {String(a.type)}
                    </CardDescription>
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {String(a.description ?? "")}
                    </p>
                    <Badge variant="outline">${Number(a.cost).toFixed(2)}</Badge>
                  </CardHeader>
                  <CardFooter className="gap-2">
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
                    <span className="text-xs text-muted-foreground">
                      Add from a trip builder for your stop
                    </span>
                  </CardFooter>
                </Card>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
