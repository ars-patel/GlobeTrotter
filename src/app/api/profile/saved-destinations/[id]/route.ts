import { NextResponse } from "next/server";
import { query } from "@/lib/db";
import { requireUser } from "@/lib/auth/require-user";

export const runtime = "nodejs";

type Ctx = { params: Promise<{ id: string }> };

export async function DELETE(_req: Request, ctx: Ctx) {
  const auth = await requireUser();
  if (auth.error) return auth.error;
  const { id } = await ctx.params;

  const { rows } = await query(
    `DELETE FROM saved_destinations
     WHERE id = $1 AND user_id = $2
     RETURNING id`,
    [id, auth.user.id]
  );
  if (!rows[0]) {
    return NextResponse.json(
      { error: "Saved destination not found" },
      { status: 404 }
    );
  }
  return NextResponse.json({ ok: true });
}
