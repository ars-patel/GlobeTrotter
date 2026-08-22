import { redirect } from "next/navigation";
import { TripForm } from "@/components/trips/trip-form";
import { getCurrentUser } from "@/lib/auth/session";

export default async function CreateTripPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/?auth=login&next=/trips/new");

  return <TripForm />;
}
