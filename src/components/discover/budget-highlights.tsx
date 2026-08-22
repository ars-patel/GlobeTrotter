import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyTitle,
} from "@/components/ui/empty";
import { Progress, ProgressLabel, ProgressValue } from "@/components/ui/progress";
import { cn } from "@/lib/utils";

export type BudgetHighlightTrip = {
  id: string;
  name: string;
  budget_limit: number | null;
  estimated_spend: number;
  start_date: string;
  end_date: string;
};

export type BudgetHighlightsSummary = {
  tripCount: number;
  totalBudget: number;
  totalSpend: number;
  tripsOverBudget: number;
};

function money(n: number) {
  return `$${n.toFixed(0)}`;
}

export function BudgetHighlights({
  trips,
  summary,
}: {
  trips: BudgetHighlightTrip[];
  summary: BudgetHighlightsSummary;
}) {
  return (
    <section className="space-y-4">
      <div className="flex items-end justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold tracking-tight">
            Budget highlights
          </h2>
          <p className="text-sm text-muted-foreground">
            Estimated spend vs limits on your active and upcoming trips
          </p>
        </div>
        <Link
          href="/trips"
          className="text-sm text-muted-foreground underline-offset-4 hover:underline"
        >
          Manage trips
        </Link>
      </div>

      {summary.tripCount === 0 ? (
        <Empty className="border border-dashed">
          <EmptyHeader>
            <EmptyTitle>No budget data yet</EmptyTitle>
            <EmptyDescription>
              Create a trip with a budget limit and activities to see highlights
              here.
            </EmptyDescription>
          </EmptyHeader>
        </Empty>
      ) : (
        <>
          <div className="grid gap-3 sm:grid-cols-3">
            <Card className="border-border shadow-none">
              <CardHeader className="gap-1">
                <CardDescription>Active / upcoming trips</CardDescription>
                <CardTitle className="text-2xl tabular-nums">
                  {summary.tripCount}
                </CardTitle>
              </CardHeader>
            </Card>
            <Card className="border-border shadow-none">
              <CardHeader className="gap-1">
                <CardDescription>Budget set</CardDescription>
                <CardTitle className="text-2xl tabular-nums">
                  {summary.totalBudget > 0
                    ? money(summary.totalBudget)
                    : "—"}
                </CardTitle>
              </CardHeader>
            </Card>
            <Card className="border-border shadow-none">
              <CardHeader className="gap-1">
                <CardDescription>Estimated spend</CardDescription>
                <CardTitle className="text-2xl tabular-nums">
                  {money(summary.totalSpend)}
                </CardTitle>
                {summary.tripsOverBudget > 0 ? (
                  <Badge variant="destructive" className="w-fit">
                    {summary.tripsOverBudget} over budget
                  </Badge>
                ) : (
                  <Badge variant="secondary" className="w-fit">
                    On track
                  </Badge>
                )}
              </CardHeader>
            </Card>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            {trips.map((trip) => {
              const limit = trip.budget_limit;
              const spend = trip.estimated_spend;
              const pct =
                limit && limit > 0
                  ? Math.min(100, Math.round((spend / limit) * 100))
                  : null;
              const over = limit != null && spend > limit;

              return (
                <Card key={trip.id} className="border-border shadow-none">
                  <CardHeader className="gap-3">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <CardTitle className="truncate text-base">
                          {trip.name}
                        </CardTitle>
                        <CardDescription>
                          {String(trip.start_date).slice(0, 10)} –{" "}
                          {String(trip.end_date).slice(0, 10)}
                        </CardDescription>
                      </div>
                      <Link
                        href={`/trips/${trip.id}/budget`}
                        className={cn(buttonVariants({ variant: "ghost", size: "sm" }))}
                      >
                        Details
                      </Link>
                    </div>

                    {limit != null && limit > 0 && pct != null ? (
                      <Progress
                        value={pct}
                        className={cn(over && "[&_[data-slot=progress-indicator]]:bg-destructive")}
                      >
                        <ProgressLabel>
                          {money(spend)} of {money(limit)}
                        </ProgressLabel>
                        <ProgressValue />
                      </Progress>
                    ) : (
                      <p className="text-sm text-muted-foreground">
                        Spend {money(spend)}
                        {limit == null ? " · no budget limit set" : null}
                      </p>
                    )}
                  </CardHeader>
                </Card>
              );
            })}
          </div>
        </>
      )}
    </section>
  );
}
