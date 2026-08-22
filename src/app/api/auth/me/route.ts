import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/session";

export const runtime = "nodejs";

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    return NextResponse.json({ user });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to load session";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
