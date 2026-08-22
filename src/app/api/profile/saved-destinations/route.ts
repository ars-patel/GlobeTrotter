import { NextResponse } from "next/server";
import { z } from "zod";
import { query } from "@/lib/db";
import { requireUser } from "@/lib/auth/require-user";

export const runtime = "nodejs";

const createSchema = z.object({
  city_id: z.string().uuid(),
});

export async function GET() {
  const auth = await requireUser();
  if (auth.error) return auth.error;

  const { rows } = await query(
    `SELECT
       sd.id,
       sd.city_id,
       c.name AS city_name,
       c.country,
       c.region,
       c.image_url
     FROM saved_destinations sd
     JOIN cities c ON c.id = sd.city_id
     WHERE sd.user_id = $1
     ORDER BY c.name ASC`,
    [auth.user.id]
  );
  return NextResponse.json({ saved_destinations: rows });
}

export async function POST(request: Request) {
  const auth = await requireUser();
  if (auth.error) return auth.error;

  const parsed = createSchema.safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid input" },
      { status: 400 }
    );
  }

  const city = await query(`SELECT id FROM cities WHERE id = $1`, [
    parsed.data.city_id,
  ]);
  if (!city.rows[0]) {
    return NextResponse.json({ error: "City not found" }, { status: 404 });
  }

  try {
    const { rows } = await query(
      `INSERT INTO saved_destinations (user_id, city_id)
       VALUES ($1, $2)
       ON CONFLICT (user_id, city_id) DO UPDATE SET city_id = EXCLUDED.city_id
       RETURNING id, city_id`,
      [auth.user.id, parsed.data.city_id]
    );

    const detail = await query(
      `SELECT
         sd.id,
         sd.city_id,
         c.name AS city_name,
         c.country,
         c.region,
         c.image_url
       FROM saved_destinations sd
       JOIN cities c ON c.id = sd.city_id
       WHERE sd.id = $1`,
      [rows[0].id]
    );

    return NextResponse.json(
      { saved_destination: detail.rows[0] },
      { status: 201 }
    );
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to save destination";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
