import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PublicItineraryView } from "@/components/trips/public-itinerary-view";
import { getCurrentUser } from "@/lib/auth/session";
import { query } from "@/lib/db";
import { getTripItinerary } from "@/lib/trips/queries";
import { toDateString } from "@/lib/dates";

type Props = { params: Promise<{ slug: string }> };

function appOrigin() {
  return (process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000").replace(
    /\/$/,
    ""
  );
}

async function loadPublicTrip(slug: string) {
  const { rows } = await query(
    `SELECT
       id, name, description, cover_photo,
       to_char(start_date, 'YYYY-MM-DD') AS start_date,
       to_char(end_date, 'YYYY-MM-DD') AS end_date,
       start_point, end_point, budget_limit, share_slug
     FROM trips
     WHERE share_slug = $1 AND is_public = TRUE`,
    [slug]
  );
  return rows[0] ?? null;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const trip = await loadPublicTrip(slug);
  if (!trip) return { title: "Shared trip not found" };
  const title = `${trip.name} · Shared itinerary`;
  const description =
    (trip.description && String(trip.description).slice(0, 160)) ||
    `Public GlobeTrotter itinerary · ${toDateString(trip.start_date)} – ${toDateString(trip.end_date)}`;
  const url = `${appOrigin()}/share/${slug}`;
  const images = trip.cover_photo
    ? [{ url: String(trip.cover_photo) }]
    : undefined;
  return {
    title,
    description,
    openGraph: { title, description, url, images, type: "website" },
    twitter: { card: "summary_large_image", title, description, images },
  };
}

export default async function PublicSharePage({ params }: Props) {
  const { slug } = await params;
  const user = await getCurrentUser();
  const trip = await loadPublicTrip(slug);
  if (!trip) notFound();

  const { stops, activities } = await getTripItinerary(String(trip.id));
  const mappedStops = stops.map((s) => ({
    id: String(s.id),
    city_name: String(s.city_name),
    country: String(s.country ?? ""),
    start_date: toDateString(s.start_date),
    end_date: toDateString(s.end_date),
    stop_order: Number(s.stop_order),
  }));
  const mappedActivities = activities.map((a) => ({
    id: String(a.id),
    stop_id: String(a.stop_id),
    activity_name: String(a.activity_name),
    day_date: toDateString(a.day_date),
    start_time: a.start_time ? String(a.start_time) : null,
    end_time: a.end_time ? String(a.end_time) : null,
    type: a.type ? String(a.type) : null,
    cost: Number(a.custom_cost ?? a.cost ?? 0),
  }));
  const summary = {
    stopCount: mappedStops.length,
    activityCount: mappedActivities.length,
    estimatedCost: mappedActivities.reduce((s, a) => s + a.cost, 0),
    cities: [...new Set(mappedStops.map((s) => s.city_name))],
  };

  const shareUrl = `${appOrigin()}/share/${slug}`;

  return (
    <PublicItineraryView
      slug={slug}
      shareUrl={shareUrl}
      isLoggedIn={Boolean(user)}
      trip={{
        name: String(trip.name),
        description: trip.description ? String(trip.description) : null,
        cover_photo: trip.cover_photo ? String(trip.cover_photo) : null,
        start_date: toDateString(trip.start_date),
        end_date: toDateString(trip.end_date),
        start_point: trip.start_point ? String(trip.start_point) : null,
        end_point: trip.end_point ? String(trip.end_point) : null,
        budget_limit:
          trip.budget_limit == null ? null : Number(trip.budget_limit),
      }}
      stops={mappedStops}
      activities={mappedActivities}
      summary={summary}
    />
  );
}
