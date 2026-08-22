import { NextRequest, NextResponse } from "next/server";
import { query } from "@/lib/db";
import {
  JOURNEY_SELECT,
  journeySearchSchema,
  type JourneyRow,
} from "@/lib/journeys";

export const runtime = "nodejs";

async function searchJourneys(request: NextRequest) {
  const sp = request.nextUrl.searchParams;
  const parsed = journeySearchSchema.safeParse({
    from: sp.get("from") ?? "",
    to: sp.get("to") ?? "",
    departure: sp.get("departure") ?? "",
    returnDate: sp.get("return") || undefined,
    passengers: sp.get("passengers") ?? "1",
  });

  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid search" },
      { status: 400 }
    );
  }

  const { from, to, departure, passengers } = parsed.data;

  try {
    const { rows } = await query<JourneyRow>(
      `SELECT ${JOURNEY_SELECT}
       FROM journeys j
       JOIN cities fc ON fc.id = j.from_city_id
       JOIN cities tc ON tc.id = j.to_city_id
       JOIN operators o ON o.id = j.operator_id
       LEFT JOIN travel_categories cat ON cat.id = j.category_id
       WHERE j.seats_available >= $1
         AND DATE(j.departure_at AT TIME ZONE 'UTC') >= $2::date
         AND (
           fc.name ILIKE $3 OR fc.country ILIKE $3
         )
         AND (
           tc.name ILIKE $4 OR tc.country ILIKE $4
         )
       ORDER BY j.price ASC, j.departure_at ASC
       LIMIT 50`,
      [passengers, departure, `%${from}%`, `%${to}%`]
    );

    return NextResponse.json({
      journeys: rows,
      query: {
        from,
        to,
        departure,
        returnDate: parsed.data.returnDate ?? null,
        passengers,
      },
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Search failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  return searchJourneys(request);
}
