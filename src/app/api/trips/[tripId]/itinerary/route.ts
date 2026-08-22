import { NextRequest, NextResponse } from "next/server";
import { requireUser } from "@/lib/auth/require-user";
import { getOwnedTrip, getTripItinerary } from "@/lib/trips/queries";

export const runtime = "nodejs";

type Ctx = { params: Promise<{ tripId: string }> };

export async function GET(_req: NextRequest, ctx: Ctx) {
  const auth = await requireUser();
  if (auth.error) return auth.error;
  const { tripId } = await ctx.params;

  const trip = await getOwnedTrip(tripId, auth.user.id);
  if (!trip) {
    return NextResponse.json({ error: "Trip not found" }, { status: 404 });
  }

  const itinerary = await getTripItinerary(tripId);
  return NextResponse.json({ trip, ...itinerary });
}
