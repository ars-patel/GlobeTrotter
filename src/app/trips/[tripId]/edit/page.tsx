import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { AppHeader } from "@/components/layout/app-header";
import { EditTripForm } from "@/components/trips/edit-trip-form";
import { buttonVariants } from "@/components/ui/button";
import { getCurrentUser } from "@/lib/auth/session";
import { getOwnedTrip } from "@/lib/trips/queries";
import { cn } from "@/lib/utils";

type Props = { params: Promise<{ tripId: string }> };

export default async function EditTripPage({ params }: Props) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  const { tripId } = await params;
  const trip = await getOwnedTrip(tripId, user.id);
  if (!trip) notFound();

  return (
    <div className="flex min-h-full flex-1 flex-col">
      <AppHeader user={user} />
      <main className="mx-auto w-full max-w-2xl flex-1 space-y-6 px-4 py-8 sm:px-6 sm:py-10">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
              Manage trip
            </p>
            <h1 className="text-2xl font-semibold tracking-tight">Edit trip</h1>
            <p className="text-sm text-muted-foreground">
              Update name, dates, description, and cover photo.
            </p>
          </div>
          <Link
            href="/trips"
            className={cn(buttonVariants({ variant: "outline", size: "sm" }))}
          >
            Back to My Trips
          </Link>
        </div>
        <EditTripForm
          trip={{
            id: String(trip.id),
            name: String(trip.name),
            description: trip.description ? String(trip.description) : null,
            cover_photo: trip.cover_photo ? String(trip.cover_photo) : null,
            start_date: String(trip.start_date),
            end_date: String(trip.end_date),
            start_point: trip.start_point ? String(trip.start_point) : null,
            end_point: trip.end_point ? String(trip.end_point) : null,
            budget_limit:
              trip.budget_limit == null ? null : Number(trip.budget_limit),
          }}
        />
      </main>
    </div>
  );
}
