import { redirect, notFound } from "next/navigation";
import { AppHeader } from "@/components/layout/app-header";
import { getCurrentUser } from "@/lib/auth/session";
import { getOwnedTrip } from "@/lib/trips/queries";

type Props = { params: Promise<{ tripId: string }> };

/** Edit uses create form fields via redirect to builder for MVP polish later */
export default async function EditTripPage({ params }: Props) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  const { tripId } = await params;
  const trip = await getOwnedTrip(tripId, user.id);
  if (!trip) notFound();
  redirect(`/trips/${tripId}/builder`);
}
