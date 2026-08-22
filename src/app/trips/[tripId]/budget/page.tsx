import { redirect, notFound } from "next/navigation";
import { AppHeader } from "@/components/layout/app-header";
import { TripSubNav } from "@/components/trips/trip-sub-nav";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { getCurrentUser } from "@/lib/auth/session";
import { getOwnedTrip, getTripItinerary } from "@/lib/trips/queries";
import { query } from "@/lib/db";

type Props = { params: Promise<{ tripId: string }> };

export default async function BudgetPage({ params }: Props) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  const { tripId } = await params;
  const trip = await getOwnedTrip(tripId, user.id);
  if (!trip) notFound();

  const { activities } = await getTripItinerary(tripId);
  const costs = await query(
    `SELECT category, SUM(amount)::float AS total
     FROM trip_costs WHERE trip_id = $1
     GROUP BY category`,
    [tripId]
  );

  let activitiesTotal = 0;
  const byDay: Record<string, number> = {};
  for (const a of activities) {
    const amount = Number(a.custom_cost ?? a.cost ?? 0);
    activitiesTotal += amount;
    const day = String(a.day_date).slice(0, 10);
    byDay[day] = (byDay[day] ?? 0) + amount;
  }

  const manualTotal = costs.rows.reduce(
    (sum, r) => sum + Number(r.total ?? 0),
    0
  );
  const total = activitiesTotal + manualTotal;
  const start = new Date(String(trip.start_date));
  const end = new Date(String(trip.end_date));
  const dayCount = Math.max(
    1,
    Math.round((end.getTime() - start.getTime()) / 86400000) + 1
  );
  const avgPerDay = total / dayCount;
  const limit = trip.budget_limit != null ? Number(trip.budget_limit) : null;
  const dailyCap = limit != null ? limit / dayCount : null;
  const overBudgetDays = Object.entries(byDay)
    .filter(([, v]) => dailyCap != null && v > dailyCap)
    .map(([d]) => d);

  const byCategory: Record<string, number> = {
    ACTIVITIES: activitiesTotal,
  };
  for (const row of costs.rows) {
    byCategory[String(row.category)] =
      (byCategory[String(row.category)] ?? 0) + Number(row.total ?? 0);
  }

  return (
    <div className="flex min-h-full flex-1 flex-col">
      <AppHeader user={user} />
      <main className="mx-auto w-full max-w-3xl flex-1 space-y-6 px-6 py-8">
        <TripSubNav tripId={tripId} active="budget" />
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Budget & Stats</h1>
          <p className="text-sm text-muted-foreground">
            Live totals from activities and cost lines
          </p>
        </div>

        {limit != null && total > limit ? (
          <Alert variant="destructive">
            <AlertDescription>
              Trip is over budget: ${total.toFixed(2)} / ${limit.toFixed(2)}
            </AlertDescription>
          </Alert>
        ) : null}

        {overBudgetDays.length > 0 ? (
          <Alert>
            <AlertDescription>
              Over-budget days (vs daily share of limit): {overBudgetDays.join(", ")}
            </AlertDescription>
          </Alert>
        ) : null}

        <div className="grid gap-3 sm:grid-cols-3">
          <Card className="border-border shadow-none">
            <CardHeader>
              <CardTitle className="text-sm text-muted-foreground">Total</CardTitle>
            </CardHeader>
            <CardContent className="text-2xl font-semibold">
              ${total.toFixed(2)}
            </CardContent>
          </Card>
          <Card className="border-border shadow-none">
            <CardHeader>
              <CardTitle className="text-sm text-muted-foreground">Avg / day</CardTitle>
            </CardHeader>
            <CardContent className="text-2xl font-semibold">
              ${avgPerDay.toFixed(2)}
            </CardContent>
          </Card>
          <Card className="border-border shadow-none">
            <CardHeader>
              <CardTitle className="text-sm text-muted-foreground">Limit</CardTitle>
            </CardHeader>
            <CardContent className="text-2xl font-semibold">
              {limit != null ? `$${limit.toFixed(2)}` : "—"}
            </CardContent>
          </Card>
        </div>

        <Card className="border-border shadow-none">
          <CardHeader>
            <CardTitle className="text-base">By category</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {Object.entries(byCategory).map(([cat, amount]) => (
              <div key={cat} className="flex justify-between text-sm">
                <span>{cat}</span>
                <span>${amount.toFixed(2)}</span>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="border-border shadow-none">
          <CardHeader>
            <CardTitle className="text-base">By day</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {Object.keys(byDay).length === 0 ? (
              <p className="text-sm text-muted-foreground">No activity costs yet.</p>
            ) : (
              Object.entries(byDay)
                .sort(([a], [b]) => a.localeCompare(b))
                .map(([day, amount]) => (
                  <div key={day} className="flex justify-between text-sm">
                    <span>{day}</span>
                    <span>${amount.toFixed(2)}</span>
                  </div>
                ))
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
