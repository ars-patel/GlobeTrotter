import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { query } from "@/lib/db";
import { requireUser } from "@/lib/auth/require-user";
import { getOwnedTrip } from "@/lib/trips/queries";
import { toDateString } from "@/lib/dates";

export const runtime = "nodejs";

type Ctx = { params: Promise<{ tripId: string }> };

const MANUAL_CATEGORIES = [
  "TRANSPORT",
  "STAY",
  "MEALS",
  "OTHER",
] as const;

const createSchema = z.object({
  category: z.enum(MANUAL_CATEGORIES),
  label: z.string().trim().max(200).optional().nullable(),
  amount: z.number().nonnegative(),
  day_date: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/)
    .optional()
    .nullable(),
});

export async function GET(_req: NextRequest, ctx: Ctx) {
  const auth = await requireUser();
  if (auth.error) return auth.error;
  const { tripId } = await ctx.params;
  const trip = await getOwnedTrip(tripId, auth.user.id);
  if (!trip) {
    return NextResponse.json({ error: "Trip not found" }, { status: 404 });
  }

  const { rows } = await query(
    `SELECT
       id, category::text AS category, label, amount::float AS amount,
       CASE WHEN day_date IS NULL THEN NULL ELSE to_char(day_date, 'YYYY-MM-DD') END AS day_date
     FROM trip_costs
     WHERE trip_id = $1
     ORDER BY category ASC, id ASC`,
    [tripId]
  );
  return NextResponse.json({ costs: rows });
}

export async function POST(request: NextRequest, ctx: Ctx) {
  const auth = await requireUser();
  if (auth.error) return auth.error;
  const { tripId } = await ctx.params;
  const trip = await getOwnedTrip(tripId, auth.user.id);
  if (!trip) {
    return NextResponse.json({ error: "Trip not found" }, { status: 404 });
  }

  const body = await request.json();
  const parsed = createSchema.safeParse({
    ...body,
    amount: Number(body.amount),
    day_date: body.day_date === "" ? null : body.day_date,
  });
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid input" },
      { status: 400 }
    );
  }

  if (parsed.data.day_date) {
    const start = toDateString(trip.start_date);
    const end = toDateString(trip.end_date);
    if (parsed.data.day_date < start || parsed.data.day_date > end) {
      return NextResponse.json(
        { error: "Cost day must fall within the trip dates" },
        { status: 400 }
      );
    }
  }

  const { rows } = await query(
    `INSERT INTO trip_costs (trip_id, category, label, amount, day_date)
     VALUES ($1, $2::budget_category, $3, $4, $5)
     RETURNING
       id, category::text AS category, label, amount::float AS amount,
       CASE WHEN day_date IS NULL THEN NULL ELSE to_char(day_date, 'YYYY-MM-DD') END AS day_date`,
    [
      tripId,
      parsed.data.category,
      parsed.data.label?.trim() ? parsed.data.label : null,
      parsed.data.amount,
      parsed.data.day_date ?? null,
    ]
  );

  return NextResponse.json({ cost: rows[0] }, { status: 201 });
}
