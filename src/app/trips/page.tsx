import { redirect } from "next/navigation";
import { AppShell } from "@/components/layout/app-header";
import { TripsBoard } from "@/components/trips/trips-board";
import type { TripListItem, TripStatus } from "@/components/trips/trip-list-card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { getCurrentUser } from "@/lib/auth/session";
import { query } from "@/lib/db";
import { toDateString } from "@/lib/dates";

function statusFor(
  start: string,
  end: string,
  today: string
): TripStatus {
  if (start <= today && today <= end) return "ongoing";
  if (start > today) return "upcoming";
  return "completed";
}

export default async function TripsPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  try {
    const { rows } = await query<{
      id: string;
      name: string;
      description: string | null;
      cover_photo: string | null;
      start_date: string;
      end_date: string;
      start_point: string | null;
      end_point: string | null;
      destination_count: number;
    }>(
      `SELECT
         t.id, t.name, t.description, t.cover_photo,
         to_char(t.start_date, 'YYYY-MM-DD') AS start_date,
         to_char(t.end_date, 'YYYY-MM-DD') AS end_date,
         t.start_point, t.end_point,
         (SELECT COUNT(*)::int FROM trip_stops s WHERE s.trip_id = t.id) AS destination_count
       FROM trips t
       WHERE t.user_id = $1
       ORDER BY t.start_date ASC, t.created_at DESC`,
      [user.id]
    );

    const today = new Date().toISOString().slice(0, 10);
    const trips: TripListItem[] = rows.map((t) => {
      const start = toDateString(t.start_date);
      const end = toDateString(t.end_date);
      return {
        id: t.id,
        name: t.name,
        description: t.description,
        cover_photo: t.cover_photo,
        start_date: start,
        end_date: end,
        start_point: t.start_point,
        end_point: t.end_point,
        destination_count: Number(t.destination_count),
        status: statusFor(start, end, today),
      };
    });

    return (
      <AppShell user={user}>
        <main className="mx-auto w-full max-w-3xl flex-1 px-6 py-10">
          <TripsBoard trips={trips} />
        </main>
      </AppShell>
    );
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to load trips";
    return (
      <AppShell user={user}>
        <main className="mx-auto w-full max-w-3xl flex-1 px-6 py-10">
          <Alert variant="destructive">
            <AlertDescription>{message}</AlertDescription>
          </Alert>
        </main>
      </AppShell>
    );
  }
}
