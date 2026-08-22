import { NextRequest, NextResponse } from "next/server";
import { query } from "@/lib/db";

export const runtime = "nodejs";

export async function GET() {
  try {
    const { rows } = await query(
      `SELECT id, slug, title, description, icon, image_url, sort_order
       FROM travel_categories
       ORDER BY sort_order ASC, title ASC`
    );
    return NextResponse.json({ categories: rows });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to load categories";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
