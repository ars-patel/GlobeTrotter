import { NextRequest, NextResponse } from "next/server";
import { query } from "@/lib/db";
import { requireUser } from "@/lib/auth/require-user";

export const runtime = "nodejs";

function seasonForMonth(month: number) {
  if (month === 12 || month <= 2) return "winter";
  if (month <= 5) return "spring";
  if (month <= 8) return "summer";
  return "autumn";
}

/** GET /api/packing-suggestions?start_date=YYYY-MM-DD — from DB templates only */
export async function GET(request: NextRequest) {
  const auth = await requireUser();
  if (auth.error) return auth.error;

  try {
    const startDate = request.nextUrl.searchParams.get("start_date");
    if (!startDate || !/^\d{4}-\d{2}-\d{2}$/.test(startDate)) {
      return NextResponse.json(
        { error: "start_date (YYYY-MM-DD) is required" },
        { status: 400 }
      );
    }

    const month = Number(startDate.slice(5, 7));
    const season = seasonForMonth(month);

    const { rows } = await query(
      `SELECT id, season, month_from, month_to, label, sort_order
       FROM packing_suggestion_templates
       WHERE is_active = TRUE
         AND (
           season = 'all'
           OR season = $1
           OR (
             month_from IS NOT NULL AND month_to IS NOT NULL
             AND (
               (month_from <= month_to AND $2 BETWEEN month_from AND month_to)
               OR (month_from > month_to AND ($2 >= month_from OR $2 <= month_to))
             )
           )
         )
       ORDER BY sort_order ASC, label ASC
       LIMIT 6`,
      [season, month]
    );

    return NextResponse.json({ suggestions: rows, season, month });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to load suggestions";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
