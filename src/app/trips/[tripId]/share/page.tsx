import { redirect, notFound } from "next/navigation";
import { AppShell } from "@/components/layout/app-header";
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
    <AppShell user={user}>
      <main className="mx-auto w-full max-w-3xl flex-1 space-y-6 px-6 py-8">
        <TripSubNav tripId={tripId} active="share" />
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Share trip</h1>
          <p className="text-sm text-muted-foreground">{trip.name}</p>
        </div>
        <ShareTripPanel
          key={tripId}
          tripId={tripId}
          tripName={String(trip.name)}
          initialPublic={Boolean(trip.is_public)}
          initialSlug={trip.share_slug}
          appOrigin={(process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000").replace(/\/$/, "")}
        />
      </main>
    </AppShell>
  );
}
