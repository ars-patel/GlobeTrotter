import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
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
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">
            Money
          </p>
          <h2 className="mt-1 font-display text-2xl font-bold tracking-tight">
            Budget highlights
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Estimated spend vs limits on active and upcoming trips.
          </p>
        </div>
        <Link
          href="/trips"
          className={cn(buttonVariants({ variant: "outline", size: "sm" }))}
        >
          Manage trips
        </Link>
      </div>

      {summary.tripCount === 0 ? (
        <Empty className="border border-dashed bg-card/50">
          <EmptyHeader>
            <EmptyTitle>Budgets appear after you plan a trip</EmptyTitle>
            <EmptyDescription>
              Add a budget limit when creating a trip, then log costs in the
              Budget tab.
            </EmptyDescription>
          </EmptyHeader>
          <Link
            href="/trips/new"
            className={cn(buttonVariants({ size: "sm" }), "mt-3")}
          >
            Plan a trip with a budget
          </Link>
        </Empty>
      ) : (
        <>
          <div className="grid gap-3 sm:grid-cols-3">
            <div className="rounded-2xl border border-border bg-card p-4 shadow-sm">
              <p className="text-xs text-muted-foreground">Active / upcoming</p>
              <p className="mt-1 text-2xl font-semibold tabular-nums">
                {summary.tripCount}
              </p>
            </div>
            <div className="rounded-2xl border border-border bg-card p-4 shadow-sm">
              <p className="text-xs text-muted-foreground">Budget set</p>
              <p className="mt-1 text-2xl font-semibold tabular-nums">
                {summary.totalBudget > 0 ? money(summary.totalBudget) : "—"}
              </p>
            </div>
            <div className="rounded-2xl border border-border bg-card p-4 shadow-sm">
              <p className="text-xs text-muted-foreground">Estimated spend</p>
              <p className="mt-1 text-2xl font-semibold tabular-nums">
                {money(summary.totalSpend)}
              </p>
              {summary.tripsOverBudget > 0 ? (
                <Badge variant="destructive" className="mt-2">
                  {summary.tripsOverBudget} over budget
                </Badge>
              ) : (
                <Badge variant="secondary" className="mt-2">
                  On track
                </Badge>
              )}
            </div>
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
                <div
                  key={trip.id}
                  className="rounded-2xl border border-border bg-card p-4 shadow-sm"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="truncate font-semibold">{trip.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {String(trip.start_date).slice(0, 10)} –{" "}
                        {String(trip.end_date).slice(0, 10)}
                      </p>
                    </div>
                    <Link
                      href={`/trips/${trip.id}/budget`}
                      className={cn(
                        buttonVariants({ variant: "ghost", size: "sm" })
                      )}
                    >
                      Details
                    </Link>
                  </div>

                  {limit != null && limit > 0 && pct != null ? (
                    <div className="mt-3">
                      <Progress
                        value={pct}
                        className={cn(
                          over &&
                            "[&_[data-slot=progress-indicator]]:bg-destructive"
                        )}
                      >
                        <ProgressLabel>
                          {money(spend)} of {money(limit)}
                        </ProgressLabel>
                        <ProgressValue />
                      </Progress>
                    </div>
                  ) : (
                    <p className="mt-3 text-sm text-muted-foreground">
                      Spend {money(spend)}
                      {limit == null ? " · no budget limit set" : null}
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        </>
      )}
    </section>
  );
}
