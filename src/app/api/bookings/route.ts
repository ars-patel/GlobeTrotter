import { NextResponse } from "next/server";
import { z } from "zod";
import { getPool } from "@/lib/db";
import { requireUser } from "@/lib/auth/require-user";

export const runtime = "nodejs";

const bookSchema = z.object({
  journey_id: z.string().uuid(),
  passengers: z.coerce.number().int().min(1).max(20).default(1),
});

export async function GET() {
  const auth = await requireUser();
  if (auth.error) return auth.error;

  const pool = getPool();
  const { rows } = await pool.query(
    `SELECT
       b.id, b.passengers, b.status, b.created_at::text,
       fc.name AS from_city, tc.name AS to_city,
       j.departure_at::text, j.price::float8 AS price
     FROM journey_bookings b
     JOIN journeys j ON j.id = b.journey_id
     JOIN cities fc ON fc.id = j.from_city_id
     JOIN cities tc ON tc.id = j.to_city_id
     WHERE b.user_id = $1
     ORDER BY b.created_at DESC`,
    [auth.user.id]
  );

  return NextResponse.json({ bookings: rows });
}

export async function POST(request: Request) {
  const auth = await requireUser();
  if (auth.error) return auth.error;

  try {
    const body = await request.json();
    const parsed = bookSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message ?? "Invalid input" },
        { status: 400 }
      );
    }

    const { journey_id, passengers } = parsed.data;
    const client = await getPool().connect();

    try {
      await client.query("BEGIN");
      const { rows } = await client.query<{
        id: string;
        seats_available: number;
      }>(`SELECT id, seats_available FROM journeys WHERE id = $1 FOR UPDATE`, [
        journey_id,
      ]);
      const journey = rows[0];
      if (!journey) {
        await client.query("ROLLBACK");
        return NextResponse.json({ error: "Journey not found" }, { status: 404 });
      }
      if (journey.seats_available < passengers) {
        await client.query("ROLLBACK");
        return NextResponse.json(
          { error: "Not enough seats available" },
          { status: 409 }
        );
      }

      await client.query(
        `UPDATE journeys SET seats_available = seats_available - $1 WHERE id = $2`,
        [passengers, journey_id]
      );

      const inserted = await client.query(
        `INSERT INTO journey_bookings (user_id, journey_id, passengers)
         VALUES ($1, $2, $3)
         RETURNING id, passengers, status, created_at::text`,
        [auth.user.id, journey_id, passengers]
      );

      await client.query("COMMIT");
      return NextResponse.json({ booking: inserted.rows[0] }, { status: 201 });
    } catch (err) {
      await client.query("ROLLBACK");
      throw err;
    } finally {
      client.release();
    }
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to create booking";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
