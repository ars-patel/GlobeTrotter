import { redirect } from "next/navigation";
import { AppHeader } from "@/components/layout/app-header";
import { TripForm } from "@/components/trips/trip-form";
import { getCurrentUser } from "@/lib/auth/session";

export default async function CreateTripPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  return (
    <div className="flex min-h-full flex-1 flex-col">
      <AppHeader user={user} />
      <main className="mx-auto w-full max-w-3xl flex-1 px-6 py-10">
        <TripForm />
      </main>
    </div>
  );
}
