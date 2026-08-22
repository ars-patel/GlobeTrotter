import { NextResponse } from "next/server";
import { getPool } from "@/lib/db";

export const runtime = "nodejs";

export async function GET() {
  try {
    const result = await getPool().query<{ now: string }>("SELECT NOW() AS now");
    return NextResponse.json({
      status: "ok",
      service: "globetrotter",
      database: "connected",
      serverTime: result.rows[0]?.now,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Database connection failed";
    return NextResponse.json(
      { status: "error", service: "globetrotter", database: "disconnected", message },
      { status: 503 }
    );
  }
}
