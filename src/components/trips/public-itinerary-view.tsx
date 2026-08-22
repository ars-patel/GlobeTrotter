import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { CopyTripButton } from "@/components/trips/copy-trip-button";
import { SocialShareButtons } from "@/components/trips/social-share-buttons";
import { cn } from "@/lib/utils";

export type PublicStop = {
  id: string;
  city_name: string;
  country: string;
  start_date: string;
  end_date: string;
  stop_order: number;
};

export type PublicActivity = {
  id: string;
  stop_id: string;
  activity_name: string;
  day_date: string;
  start_time: string | null;
  end_time: string | null;
  type: string | null;
  cost: number;
};

export function PublicItineraryView({
  slug,
  shareUrl,
  trip,
  stops,
  activities,
  summary,
  isLoggedIn,
}: {
  slug: string;
  shareUrl: string;
  trip: {
    name: string;
    description: string | null;
    cover_photo: string | null;
    start_date: string;
    end_date: string;
    start_point: string | null;
    end_point: string | null;
    budget_limit: number | null;
  };
  stops: PublicStop[];
  activities: PublicActivity[];
  summary: {
    stopCount: number;
    activityCount: number;
    estimatedCost: number;
    cities: string[];
  };
  isLoggedIn: boolean;
}) {
  return (
    <div className="mx-auto min-h-full w-full max-w-3xl space-y-8 px-6 py-10">
      <div className="space-y-3">
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="secondary">Read-only</Badge>
          <Badge variant="outline">Shared itinerary</Badge>
        </div>
        <h1 className="text-3xl font-semibold tracking-tight">{trip.name}</h1>
        <p className="text-sm text-muted-foreground">
          {trip.start_date} – {trip.end_date}
          {trip.start_point || trip.end_point
            ? ` · ${[trip.start_point, trip.end_point].filter(Boolean).join(" → ")}`
            : ""}
        </p>
        {trip.description ? (
          <p className="text-sm leading-relaxed text-foreground/90">
            {trip.description}
          </p>
        ) : null}
      </div>

      {trip.cover_photo ? (
        <div className="relative aspect-[21/9] overflow-hidden rounded-xl border border-border bg-muted">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={trip.cover_photo}
            alt=""
            className="h-full w-full object-cover"
          />
        </div>
      ) : null}

      <div className="grid gap-3 sm:grid-cols-3">
        <Card className="border-border shadow-none">
          <CardHeader className="pb-1">
            <CardTitle className="text-xs font-medium text-muted-foreground uppercase">
              Cities
            </CardTitle>
          </CardHeader>
          <CardContent className="text-lg font-semibold">
            {summary.stopCount}
            <p className="mt-1 text-xs font-normal text-muted-foreground">
              {summary.cities.slice(0, 4).join(" · ") || "—"}
            </p>
          </CardContent>
        </Card>
        <Card className="border-border shadow-none">
          <CardHeader className="pb-1">
            <CardTitle className="text-xs font-medium text-muted-foreground uppercase">
              Activities
            </CardTitle>
          </CardHeader>
          <CardContent className="text-lg font-semibold">
            {summary.activityCount}
          </CardContent>
        </Card>
        <Card className="border-border shadow-none">
          <CardHeader className="pb-1">
            <CardTitle className="text-xs font-medium text-muted-foreground uppercase">
              Est. activities cost
            </CardTitle>
          </CardHeader>
          <CardContent className="text-lg font-semibold tabular-nums">
            ${summary.estimatedCost.toFixed(2)}
            {trip.budget_limit != null ? (
              <p className="mt-1 text-xs font-normal text-muted-foreground">
                Budget limit ${trip.budget_limit.toFixed(2)}
              </p>
            ) : null}
          </CardContent>
        </Card>
      </div>

      <section className="space-y-3 rounded-xl border border-border p-4">
        <h2 className="text-sm font-semibold">Copy or share</h2>
        <p className="text-xs text-muted-foreground">
          Inspired? Copy this trip into your account, or share it on social.
        </p>
        <div className="flex flex-wrap items-start gap-3">
          {isLoggedIn ? (
            <CopyTripButton slug={slug} />
          ) : (
            <div className="flex flex-wrap gap-2">
              <Link
                href={`/signup?next=/share/${slug}`}
                className={cn(buttonVariants())}
              >
                Sign up to copy
              </Link>
              <Link
                href={`/login?next=/share/${slug}`}
                className={cn(buttonVariants({ variant: "outline" }))}
              >
                Log in
              </Link>
            </div>
          )}
        </div>
        <SocialShareButtons url={shareUrl} title={String(trip.name)} />
      </section>

      <div className="space-y-8">
        <h2 className="text-lg font-semibold tracking-tight">Itinerary</h2>
        {stops.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            This shared trip has no stops yet.
          </p>
        ) : (
          stops.map((s) => {
                const items = activities.filter(
                  (a) => String(a.stop_id) === String(s.id)
                );
            return (
              <section key={s.id} className="space-y-3">
                <div className="flex flex-wrap items-baseline justify-between gap-2">
                  <h3 className="text-base font-semibold">
                    {s.stop_order}. {s.city_name}
                    {s.country ? (
                      <span className="ml-1 font-normal text-muted-foreground">
                        , {s.country}
                      </span>
                    ) : null}
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    {s.start_date} – {s.end_date}
                  </p>
                </div>
                <Separator />
                {items.length === 0 ? (
                  <p className="text-sm text-muted-foreground">
                    No activities listed for this stop.
                  </p>
                ) : (
                  <ul className="space-y-2">
                    {items.map((a) => {
                      const time = [a.start_time, a.end_time]
                        .filter(Boolean)
                        .map((t) => String(t).slice(0, 5))
                        .join(" – ");
                      return (
                        <li
                          key={a.id}
                          className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-border px-3 py-2 text-sm"
                        >
                          <div>
                            <p className="font-medium">{a.activity_name}</p>
                            <p className="text-xs text-muted-foreground">
                              {a.day_date}
                              {time ? ` · ${time}` : ""}
                              {a.type ? ` · ${a.type}` : ""}
                            </p>
                          </div>
                          <Badge variant="outline">
                            ${a.cost.toFixed(2)}
                          </Badge>
                        </li>
                      );
                    })}
                  </ul>
                )}
              </section>
            );
          })
        )}
      </div>

      <p className="text-center text-xs text-muted-foreground">
        Viewing a public GlobeTrotter itinerary — editing is disabled.
      </p>
    </div>
  );
}
