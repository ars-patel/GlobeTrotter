import { redirect, notFound } from "next/navigation";
import { AppHeader } from "@/components/layout/app-header";
import { TripSubNav } from "@/components/trips/trip-sub-nav";
import { ShareTripPanel } from "@/components/trips/share-trip-panel";
import { getCurrentUser } from "@/lib/auth/session";
import { getOwnedTrip } from "@/lib/trips/queries";

type Props = { params: Promise<{ tripId: string }> };

export default async function TripSharePage({ params }: Props) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  const { tripId } = await params;
  const trip = await getOwnedTrip(tripId, user.id);
  if (!trip) notFound();

  return (
    <div className="flex min-h-full flex-1 flex-col">
      <AppHeader user={user} />
      <main className="mx-auto w-full max-w-3xl flex-1 space-y-6 px-6 py-8">
        <TripSubNav tripId={tripId} active="share" />
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Share trip</h1>
          <p className="text-sm text-muted-foreground">{trip.name}</p>
        </div>
        <ShareTripPanel
          tripId={tripId}
          initialPublic={Boolean(trip.is_public)}
          initialSlug={trip.share_slug}
        />
      </main>
    </div>
  );
}
