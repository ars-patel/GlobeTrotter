import { redirect } from "next/navigation";
import Link from "next/link";
import { AppHeader } from "@/components/layout/app-header";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { buttonVariants } from "@/components/ui/button";
import {
  Card,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { getCurrentUser } from "@/lib/auth/session";
import { query } from "@/lib/db";
import { cn } from "@/lib/utils";

export default async function ProfilePage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const { rows } = await query<{
    id: string;
    name: string;
    start_date: string;
    end_date: string;
    start_point: string | null;
    end_point: string | null;
  }>(
    `SELECT id, name, start_date, end_date, start_point, end_point
     FROM trips WHERE user_id = $1 ORDER BY start_date ASC`,
    [user.id]
  );

  const today = new Date().toISOString().slice(0, 10);
  const planned = rows.filter((t) => String(t.end_date).slice(0, 10) >= today);
  const previous = rows.filter((t) => String(t.end_date).slice(0, 10) < today);

  return (
    <div className="flex min-h-full flex-1 flex-col">
      <AppHeader user={user} />
      <main className="mx-auto w-full max-w-4xl flex-1 space-y-10 px-6 py-8">
        <section className="flex flex-wrap items-center gap-4">
          <Avatar className="size-20">
            <AvatarFallback className="text-lg">
              {user.first_name.slice(0, 1)}
              {user.last_name.slice(0, 1)}
            </AvatarFallback>
          </Avatar>
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">
              {user.first_name} {user.last_name}
            </h1>
            <p className="text-sm text-muted-foreground">{user.email}</p>
            <p className="text-sm text-muted-foreground">
              {[user.home_city, user.home_country].filter(Boolean).join(", ") ||
                "No home city set"}
            </p>
          </div>
        </section>

        <TripRow title="Planned Trip" trips={planned} />
        <TripRow title="Previous Trip" trips={previous} />
      </main>
    </div>
  );
}

function TripRow({
  title,
  trips,
}: {
  title: string;
  trips: Array<{
    id: string;
    name: string;
    start_date: string;
    end_date: string;
  }>;
}) {
  return (
    <section className="space-y-3">
      <h2 className="text-lg font-semibold tracking-tight">{title}</h2>
      {trips.length === 0 ? (
        <p className="text-sm text-muted-foreground">None yet.</p>
      ) : (
        <div className="grid gap-3 sm:grid-cols-3">
          {trips.slice(0, 3).map((t) => (
            <Card key={t.id} className="border-border shadow-none">
              <CardHeader>
                <CardTitle className="text-base">{t.name}</CardTitle>
                <CardDescription>
                  {String(t.start_date).slice(0, 10)} –{" "}
                  {String(t.end_date).slice(0, 10)}
                </CardDescription>
              </CardHeader>
              <CardFooter>
                <Link
                  href={`/trips/${t.id}/itinerary`}
                  className={cn(buttonVariants({ size: "sm" }))}
                >
                  View
                </Link>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </section>
  );
}
