import { redirect, notFound } from "next/navigation";
import { AppShell } from "@/components/layout/app-header";
import { TripSubNav } from "@/components/trips/trip-sub-nav";
import { ItineraryBuilder } from "@/components/trips/itinerary-builder";
import { getCurrentUser } from "@/lib/auth/session";
import { getOwnedTrip } from "@/lib/trips/queries";

type Props = { params: Promise<{ tripId: string }> };

export default async function BuilderPage({ params }: Props) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  const { tripId } = await params;
  const trip = await getOwnedTrip(tripId, user.id);
  if (!trip) notFound();

  return (
    <AppShell user={user}>
      <main className="mx-auto w-full max-w-3xl flex-1 space-y-6 px-6 py-8">
        <TripSubNav tripId={tripId} active="builder" />
        <ItineraryBuilder tripId={tripId} />
      </main>
    </AppShell>
  );
}
