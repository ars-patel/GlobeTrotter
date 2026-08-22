import { NextRequest, NextResponse } from "next/server";
import { query } from "@/lib/db";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  try {
    const limitRaw = Number(request.nextUrl.searchParams.get("limit") ?? 6);
    const limit = Number.isFinite(limitRaw)
      ? Math.min(Math.max(limitRaw, 1), 20)
      : 6;

    const { rows } = await query(
      `SELECT
         id, author_name, rating::float8 AS rating,
         title, body, is_demo, created_at::text
       FROM reviews
       ORDER BY created_at DESC
       LIMIT $1`,
      [limit]
    );

    return NextResponse.json({
      reviews: rows,
      meta: {
        includes_demo: rows.some((r) => Boolean((r as { is_demo: boolean }).is_demo)),
      },
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to load reviews";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
