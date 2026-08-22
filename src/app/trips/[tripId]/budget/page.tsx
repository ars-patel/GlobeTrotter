import { redirect, notFound } from "next/navigation";
import { AppHeader } from "@/components/layout/app-header";
import { TripSubNav } from "@/components/trips/trip-sub-nav";
import { BudgetCharts } from "@/components/trips/budget-charts";
import { BudgetCostForm } from "@/components/trips/budget-cost-form";
import { DeleteCostButton } from "@/components/trips/delete-cost-button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress, ProgressLabel, ProgressValue } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { getCurrentUser } from "@/lib/auth/session";
import { getOwnedTrip } from "@/lib/trips/queries";
import { getTripBudgetSnapshot } from "@/lib/trips/budget";
import { toDateString } from "@/lib/dates";

type Props = { params: Promise<{ tripId: string }> };

function money(n: number) {
  return `$${n.toFixed(2)}`;
}

export default async function BudgetPage({ params }: Props) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  const { tripId } = await params;
  const trip = await getOwnedTrip(tripId, user.id);
  if (!trip) notFound();

  const budget = await getTripBudgetSnapshot(tripId, trip);
  const tripStart = toDateString(trip.start_date);
  const tripEnd = toDateString(trip.end_date);
  const usedPct =
    budget.budgetLimit != null && budget.budgetLimit > 0
      ? Math.min(100, Math.round((budget.total / budget.budgetLimit) * 100))
      : null;

  return (
    <div className="flex min-h-full flex-1 flex-col">
      <AppHeader user={user} />
      <main className="mx-auto w-full max-w-5xl flex-1 space-y-6 px-6 py-8">
        <TripSubNav tripId={tripId} active="budget" />

        <div className="grid gap-6 lg:grid-cols-[1fr_280px]">
          <div className="space-y-6">
            <div>
              <h1 className="text-2xl font-semibold tracking-tight">
                Budget & cost breakdown
              </h1>
              <p className="text-sm text-muted-foreground">
                Live totals for {String(trip.name)} · transport, stay,
                activities, meals
              </p>
            </div>

            {budget.overBudget ? (
              <Alert variant="destructive">
                <AlertTitle>Over budget</AlertTitle>
                <AlertDescription>
                  Estimated spend {money(budget.total)} exceeds your limit of{" "}
                  {money(budget.budgetLimit!)}.
                </AlertDescription>
              </Alert>
            ) : null}

            {budget.overBudgetDays.length > 0 ? (
              <Alert>
                <AlertTitle>Over-budget days</AlertTitle>
                <AlertDescription>
                  These days exceed the daily share of your limit
                  {budget.dailyCap != null
                    ? ` (${money(budget.dailyCap)}/day)`
                    : ""}
                  : {budget.overBudgetDays.join(", ")}
                </AlertDescription>
              </Alert>
            ) : null}

            <div className="grid gap-3 sm:grid-cols-3">
              <Card className="border-border shadow-none">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Estimated total
                  </CardTitle>
                </CardHeader>
                <CardContent className="text-2xl font-semibold tabular-nums">
                  {money(budget.total)}
                </CardContent>
              </Card>
              <Card className="border-border shadow-none">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Average / day
                  </CardTitle>
                </CardHeader>
                <CardContent className="text-2xl font-semibold tabular-nums">
                  {money(budget.avgPerDay)}
                </CardContent>
              </Card>
              <Card className="border-border shadow-none">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Remaining
                  </CardTitle>
                </CardHeader>
                <CardContent className="text-2xl font-semibold tabular-nums">
                  {budget.remaining != null
                    ? money(budget.remaining)
                    : "—"}
                </CardContent>
              </Card>
            </div>

            {usedPct != null && budget.budgetLimit != null ? (
              <Progress value={usedPct}>
                <ProgressLabel>
                  {money(budget.total)} of {money(budget.budgetLimit)}
                  {budget.overBudget ? " · over limit" : ""}
                </ProgressLabel>
                <ProgressValue />
              </Progress>
            ) : null}

            <BudgetCharts
              byCategory={budget.byCategory}
              byDay={budget.byDay}
              runningTotal={budget.runningTotal}
            />

            <Card className="border-border shadow-none">
              <CardHeader>
                <CardTitle className="text-base">Category totals</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {budget.byCategory.map((row) => (
                  <div
                    key={row.category}
                    className="flex items-center justify-between text-sm"
                  >
                    <span className="flex items-center gap-2">
                      {row.category}
                      {row.category === "ACTIVITIES" ? (
                        <Badge variant="outline">from itinerary</Badge>
                      ) : null}
                    </span>
                    <span className="tabular-nums">{money(row.amount)}</span>
                  </div>
                ))}
              </CardContent>
            </Card>

            <BudgetCostForm
              tripId={tripId}
              tripStart={tripStart}
              tripEnd={tripEnd}
            />

            <Card className="border-border shadow-none">
              <CardHeader>
                <CardTitle className="text-base">Manual cost lines</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {budget.costLines.length === 0 ? (
                  <p className="text-sm text-muted-foreground">
                    No transport / stay / meals lines yet.
                  </p>
                ) : (
                  budget.costLines.map((line) => (
                    <div
                      key={line.id}
                      className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-border px-3 py-2 text-sm"
                    >
                      <div>
                        <p className="font-medium">
                          {line.label || line.category}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {line.category}
                          {line.day_date ? ` · ${line.day_date}` : ""}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="tabular-nums">
                          {money(line.amount)}
                        </span>
                        <DeleteCostButton tripId={tripId} costId={line.id} />
                      </div>
                    </div>
                  ))
                )}
              </CardContent>
            </Card>
          </div>

          <aside className="space-y-4 lg:sticky lg:top-20 lg:self-start">
            <Card className="border-border shadow-none">
              <CardHeader>
                <CardTitle className="text-base">Trip details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <div>
                  <p className="text-xs text-muted-foreground uppercase">Name</p>
                  <p className="font-medium">{String(trip.name)}</p>
                </div>
                <Separator />
                <div>
                  <p className="text-xs text-muted-foreground uppercase">Dates</p>
                  <p>
                    {tripStart} – {tripEnd}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {budget.dayCount} day{budget.dayCount === 1 ? "" : "s"}
                  </p>
                </div>
                <Separator />
                <div>
                  <p className="text-xs text-muted-foreground uppercase">
                    Budget limit
                  </p>
                  <p className="font-medium">
                    {budget.budgetLimit != null
                      ? money(budget.budgetLimit)
                      : "Not set"}
                  </p>
                </div>
                <Separator />
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground uppercase">
                    Split
                  </p>
                  <p className="flex justify-between">
                    <span>Activities</span>
                    <span className="tabular-nums">
                      {money(budget.activitiesTotal)}
                    </span>
                  </p>
                  <p className="flex justify-between">
                    <span>Other costs</span>
                    <span className="tabular-nums">
                      {money(budget.manualTotal)}
                    </span>
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card className="border-border shadow-none">
              <CardHeader>
                <CardTitle className="text-base">Daily spend</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {budget.byDay.length === 0 ? (
                  <p className="text-sm text-muted-foreground">None yet</p>
                ) : (
                  budget.byDay.map((d) => (
                    <div
                      key={d.day}
                      className="flex items-center justify-between text-sm"
                    >
                      <span className="flex items-center gap-2">
                        {d.day}
                        {d.overDailyCap ? (
                          <Badge variant="destructive">Over</Badge>
                        ) : null}
                      </span>
                      <span className="tabular-nums">{money(d.amount)}</span>
                    </div>
                  ))
                )}
              </CardContent>
            </Card>
          </aside>
        </div>
      </main>
    </div>
  );
}
