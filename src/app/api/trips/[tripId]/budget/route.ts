import { NextResponse } from "next/server";
import { requireUser } from "@/lib/auth/require-user";
import { getOwnedTrip } from "@/lib/trips/queries";
import { getTripBudgetSnapshot } from "@/lib/trips/budget";

export const runtime = "nodejs";

type Ctx = { params: Promise<{ tripId: string }> };

export async function GET(_req: Request, ctx: Ctx) {
  const auth = await requireUser();
  if (auth.error) return auth.error;
  const { tripId } = await ctx.params;
  const trip = await getOwnedTrip(tripId, auth.user.id);
  if (!trip) {
    return NextResponse.json({ error: "Trip not found" }, { status: 404 });
  }

  try {
    const budget = await getTripBudgetSnapshot(tripId, trip);
    return NextResponse.json({
      trip: {
        id: trip.id,
        name: trip.name,
        start_date: trip.start_date,
        end_date: trip.end_date,
        budget_limit: trip.budget_limit,
      },
      budget,
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to load budget";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
