import { NextRequest, NextResponse } from "next/server";
import { requireUser } from "@/lib/auth/require-user";
import { query } from "@/lib/db";

export const runtime = "nodejs";

function monthBounds(monthStr: string) {
  const [y, m] = monthStr.split("-").map(Number);
  const monthStart = `${monthStr}-01`;
  const lastDay = new Date(Date.UTC(y, m, 0)).getUTCDate();
  const monthEnd = `${monthStr}-${String(lastDay).padStart(2, "0")}`;
  return { y, m, monthStart, monthEnd, lastDay };
}

export async function GET(request: NextRequest) {
  const auth = await requireUser();
  if (auth.error) return auth.error;

  const now = new Date();
  const monthParam = request.nextUrl.searchParams.get("month");
  const monthStr =
    monthParam && /^\d{4}-\d{2}$/.test(monthParam)
      ? monthParam
      : `${now.getUTCFullYear()}-${String(now.getUTCMonth() + 1).padStart(2, "0")}`;

  const { monthStart, monthEnd } = monthBounds(monthStr);

  try {
    const trips = await query<{
      id: string;
      name: string;
      start_date: string;
      end_date: string;
      cover_photo: string | null;
    }>(
      `SELECT
         id, name,
         to_char(start_date, 'YYYY-MM-DD') AS start_date,
         to_char(end_date, 'YYYY-MM-DD') AS end_date,
         cover_photo
       FROM trips
       WHERE user_id = $1
         AND start_date <= $3::date
         AND end_date >= $2::date
       ORDER BY start_date ASC`,
      [auth.user.id, monthStart, monthEnd]
    );

    const activities = await query<{
      id: string;
      trip_id: string;
      trip_name: string;
      day_date: string;
      title: string;
      start_time: string | null;
      city_name: string | null;
      cost: number | null;
    }>(
      `SELECT
         ta.id,
         t.id AS trip_id,
         t.name AS trip_name,
         to_char(ta.day_date, 'YYYY-MM-DD') AS day_date,
         a.name AS title,
         ta.start_time,
         c.name AS city_name,
         COALESCE(ta.custom_cost, a.cost, 0)::float8 AS cost
       FROM trip_activities ta
       JOIN activities a ON a.id = ta.activity_id
       JOIN trip_stops s ON s.id = ta.stop_id
       JOIN trips t ON t.id = s.trip_id
       LEFT JOIN cities c ON c.id = s.city_id
       WHERE t.user_id = $1
         AND ta.day_date BETWEEN $2::date AND $3::date
       ORDER BY ta.day_date ASC, ta.act_order ASC, ta.start_time ASC NULLS LAST`,
      [auth.user.id, monthStart, monthEnd]
    );

    const days: Record<
      string,
      {
        date: string;
        tripIds: string[];
        activityCount: number;
        labels: string[];
      }
    > = {};

    function ensureDay(date: string) {
      if (!days[date]) {
        days[date] = {
          date,
          tripIds: [],
          activityCount: 0,
          labels: [],
        };
      }
      return days[date];
    }

    for (const t of trips.rows) {
      const start = t.start_date;
      const end = t.end_date;
      let cursor = start < monthStart ? monthStart : start;
      const stop = end > monthEnd ? monthEnd : end;
      while (cursor <= stop) {
        const day = ensureDay(cursor);
        if (!day.tripIds.includes(t.id)) day.tripIds.push(t.id);
        if (!day.labels.includes(t.name)) day.labels.push(t.name);
        const [yy, mm, dd] = cursor.split("-").map(Number);
        const next = new Date(Date.UTC(yy, mm - 1, dd + 1));
        cursor = next.toISOString().slice(0, 10);
      }
    }

    for (const a of activities.rows) {
      const day = ensureDay(a.day_date);
      day.activityCount += 1;
      if (!day.tripIds.includes(a.trip_id)) day.tripIds.push(a.trip_id);
    }

    return NextResponse.json({
      month: monthStr,
      monthStart,
      monthEnd,
      trips: trips.rows,
      activities: activities.rows,
      days,
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to load schedule";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
