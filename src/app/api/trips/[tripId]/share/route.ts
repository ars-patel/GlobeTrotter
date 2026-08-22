import { NextRequest, NextResponse } from "next/server";
import { randomBytes } from "crypto";
import { z } from "zod";
import { query } from "@/lib/db";
import { requireUser } from "@/lib/auth/require-user";
import { getOwnedTrip, getTripItinerary } from "@/lib/trips/queries";

export const runtime = "nodejs";

type Ctx = { params: Promise<{ tripId: string }> };

const shareSchema = z.object({
  is_public: z.boolean(),
});

export async function POST(request: NextRequest, ctx: Ctx) {
  const auth = await requireUser();
  if (auth.error) return auth.error;
  const { tripId } = await ctx.params;
  const trip = await getOwnedTrip(tripId, auth.user.id);
  if (!trip) return NextResponse.json({ error: "Trip not found" }, { status: 404 });

  const parsed = shareSchema.safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid input" }, { status: 400 });
  }

  let slug = trip.share_slug as string | null;
  if (parsed.data.is_public && !slug) {
    slug = randomBytes(6).toString("hex");
  }

  const { rows } = await query(
    `UPDATE trips
     SET is_public = $1,
         share_slug = CASE
           WHEN $1 THEN COALESCE(share_slug, $2)
           ELSE share_slug
         END,
         updated_at = NOW()
     WHERE id = $3 AND user_id = $4
     RETURNING id, name, is_public, share_slug`,
    [parsed.data.is_public, slug, tripId, auth.user.id]
  );

  const updated = rows[0];
  if (!updated) {
    return NextResponse.json({ error: "Trip not found" }, { status: 404 });
  }
  const appUrl = (process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000").replace(
    /\/$/,
    ""
  );

  return NextResponse.json({
    trip: updated,
    shareUrl:
      updated.is_public && updated.share_slug
        ? `${appUrl}/share/${updated.share_slug}`
        : null,
  });
}

export async function GET(_req: NextRequest, ctx: Ctx) {
  const auth = await requireUser();
  if (auth.error) return auth.error;
  const { tripId } = await ctx.params;
  const trip = await getOwnedTrip(tripId, auth.user.id);
  if (!trip) return NextResponse.json({ error: "Trip not found" }, { status: 404 });
  const itinerary = await getTripItinerary(tripId);
  return NextResponse.json({ trip, ...itinerary });
}
