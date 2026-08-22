import { notFound } from "next/navigation";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { CopyTripButton } from "@/components/trips/copy-trip-button";
import { getCurrentUser } from "@/lib/auth/session";
import { query } from "@/lib/db";
import { getTripItinerary } from "@/lib/trips/queries";
import { cn } from "@/lib/utils";

type Props = { params: Promise<{ slug: string }> };

export default async function PublicSharePage({ params }: Props) {
  const { slug } = await params;
  const user = await getCurrentUser();
  const { rows } = await query(
    `SELECT id, name, description, start_date, end_date, start_point, end_point, cover_photo
     FROM trips
     WHERE share_slug = $1 AND is_public = TRUE`,
    [slug]
  );
  const trip = rows[0];
  if (!trip) notFound();

  const { stops, activities } = await getTripItinerary(trip.id);

  return (
    <div className="mx-auto min-h-full w-full max-w-3xl px-6 py-10">
      <p className="text-xs uppercase tracking-wide text-muted-foreground">
        Shared itinerary
      </p>
      <h1 className="mt-2 text-3xl font-semibold tracking-tight">{trip.name}</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        {String(trip.start_date).slice(0, 10)} – {String(trip.end_date).slice(0, 10)}
        {trip.start_point || trip.end_point
          ? ` · ${[trip.start_point, trip.end_point].filter(Boolean).join(" → ")}`
          : ""}
      </p>
      {trip.description ? (
        <p className="mt-4 text-sm leading-relaxed">{trip.description}</p>
      ) : null}

      <div className="mt-6 flex flex-wrap items-center gap-2">
        {user ? (
          <CopyTripButton slug={slug} />
        ) : (
          <>
            <Link href={`/signup?next=/share/${slug}`} className={cn(buttonVariants())}>
              Sign up to copy
            </Link>
            <Link
              href={`/login?next=/share/${slug}`}
              className={cn(buttonVariants({ variant: "outline" }))}
            >
              Log in
            </Link>
          </>
        )}
      </div>

      <div className="mt-10 space-y-8">
        {stops.map((s) => (
          <section key={s.id} className="space-y-3">
            <h2 className="text-lg font-semibold">{s.city_name}</h2>
            <Separator />
            <ul className="space-y-2">
              {activities
                .filter((a) => a.stop_id === s.id)
                .map((a) => (
                  <li
                    key={a.id}
                    className="flex items-center justify-between rounded-lg border border-border px-3 py-2 text-sm"
                  >
                    <span>
                      {a.activity_name}
                      <span className="ml-2 text-xs text-muted-foreground">
                        {String(a.day_date).slice(0, 10)}
                      </span>
                    </span>
                    <Badge variant="outline">
                      ${Number(a.custom_cost ?? a.cost ?? 0).toFixed(2)}
                    </Badge>
                  </li>
                ))}
            </ul>
          </section>
        ))}
      </div>
    </div>
  );
}
