import { redirect } from "next/navigation";
import { AppShell } from "@/components/layout/app-header";
import { TripForm } from "@/components/trips/trip-form";
import { getCurrentUser } from "@/lib/auth/session";

export default async function CreateTripPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  return (
    <AppShell user={user}>
      <main className="mx-auto w-full max-w-2xl flex-1 px-4 py-8 sm:px-6 sm:py-10">
        <TripForm />
      </main>
    </AppShell>
  );
}
