import { NextResponse } from "next/server";
import { query } from "@/lib/db";
import { requireUser } from "@/lib/auth/require-user";
import { getOwnedTrip } from "@/lib/trips/queries";
import { updateTripSchema } from "@/lib/trips/schemas";

export const runtime = "nodejs";

type Ctx = { params: Promise<{ tripId: string }> };

export async function GET(_req: Request, ctx: Ctx) {
  const auth = await requireUser();
  if (auth.error) return auth.error;
  const { tripId } = await ctx.params;
  const trip = await getOwnedTrip(tripId, auth.user.id);
  if (!trip) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ trip });
}

export async function PATCH(request: Request, ctx: Ctx) {
  const auth = await requireUser();
  if (auth.error) return auth.error;
  const { tripId } = await ctx.params;
  const trip = await getOwnedTrip(tripId, auth.user.id);
  if (!trip) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const body = await request.json();
  const parsed = updateTripSchema.safeParse({
    ...body,
    description: body.description === "" ? null : body.description,
    cover_photo: body.cover_photo === "" ? null : body.cover_photo,
    budget_limit:
      body.budget_limit === "" || body.budget_limit == null
        ? null
        : Number(body.budget_limit),
  });
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid input" },
      { status: 400 }
    );
  }

  const d = parsed.data;
  const { rows } = await query(
    `UPDATE trips SET
       name = $1,
       description = $2,
       cover_photo = $3,
       start_date = $4,
       end_date = $5,
       start_point = $6,
       end_point = $7,
       budget_limit = $8,
       updated_at = NOW()
     WHERE id = $9 AND user_id = $10
     RETURNING *`,
    [
      d.name,
      d.description?.trim() ? d.description : null,
      d.cover_photo?.trim() ? d.cover_photo : null,
      d.start_date,
      d.end_date,
      d.start_point,
      d.end_point,
      d.budget_limit,
      tripId,
      auth.user.id,
    ]
  );
  return NextResponse.json({ trip: rows[0] });
}

export async function DELETE(_req: Request, ctx: Ctx) {
  const auth = await requireUser();
  if (auth.error) return auth.error;
  const { tripId } = await ctx.params;
  const trip = await getOwnedTrip(tripId, auth.user.id);
  if (!trip) return NextResponse.json({ error: "Not found" }, { status: 404 });
  await query(`DELETE FROM trips WHERE id = $1 AND user_id = $2`, [
    tripId,
    auth.user.id,
  ]);
  return NextResponse.json({ ok: true });
}
