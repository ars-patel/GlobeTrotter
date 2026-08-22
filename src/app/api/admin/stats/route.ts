import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth/require-admin";
import { getAdminStats } from "@/lib/admin/stats";

export const runtime = "nodejs";

export async function GET() {
  const auth = await requireAdmin();
  if (auth.error) return auth.error;

  try {
    const stats = await getAdminStats();
    return NextResponse.json({ stats });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to load admin stats";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
