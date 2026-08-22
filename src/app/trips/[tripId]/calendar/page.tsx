import { redirect, notFound } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/session";
import { getOwnedTrip } from "@/lib/trips/queries";

type Props = { params: Promise<{ tripId: string }> };

/** Calendar view lives on Itinerary with ?mode=calendar (PS view toggle). */
export default async function TripCalendarPage({ params }: Props) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  const { tripId } = await params;
  const trip = await getOwnedTrip(tripId, user.id);
  if (!trip) notFound();
  redirect(`/trips/${tripId}/itinerary?mode=calendar`);
}
