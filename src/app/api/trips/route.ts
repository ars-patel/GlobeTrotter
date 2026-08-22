import { NextResponse } from "next/server";
import { query } from "@/lib/db";

export const runtime = "nodejs";

export async function GET() {
  try {
    const { rows } = await query(
      `SELECT id, name, description, start_date, end_date, is_public, created_at
       FROM trips
       ORDER BY created_at DESC
       LIMIT 50`
    );
    return NextResponse.json({ trips: rows });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to load trips";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST() {
  return NextResponse.json(
    { message: "Create trip endpoint scaffolded." },
    { status: 501 }
  );
}
