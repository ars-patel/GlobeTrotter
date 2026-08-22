import { NextResponse } from "next/server";
import { query } from "@/lib/db";
import { requireUser } from "@/lib/auth/require-user";
import { getOwnedTrip } from "@/lib/trips/queries";
import { createTripSchema } from "@/lib/trips/schemas";

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
  const parsed = createTripSchema.partial().safeParse({
    ...body,
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
       name = COALESCE($1, name),
       description = COALESCE($2, description),
       cover_photo = COALESCE($3, cover_photo),
       start_date = COALESCE($4, start_date),
       end_date = COALESCE($5, end_date),
       start_point = COALESCE($6, start_point),
       end_point = COALESCE($7, end_point),
       budget_limit = COALESCE($8, budget_limit),
       updated_at = NOW()
     WHERE id = $9 AND user_id = $10
     RETURNING *`,
    [
      d.name ?? null,
      d.description ?? null,
      d.cover_photo ?? null,
      d.start_date ?? null,
      d.end_date ?? null,
      d.start_point ?? null,
      d.end_point ?? null,
      d.budget_limit === undefined ? null : d.budget_limit,
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
