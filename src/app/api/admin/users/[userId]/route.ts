import { NextResponse } from "next/server";
import { z } from "zod";
import { query } from "@/lib/db";
import { requireAdmin } from "@/lib/auth/require-admin";

export const runtime = "nodejs";

type Ctx = { params: Promise<{ userId: string }> };

const patchSchema = z.object({
  role: z.enum(["USER", "ADMIN"]),
});

export async function PATCH(request: Request, ctx: Ctx) {
  const auth = await requireAdmin();
  if (auth.error) return auth.error;
  const { userId } = await ctx.params;

  const parsed = patchSchema.safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid input" },
      { status: 400 }
    );
  }

  const target = await query<{ id: string; role: string }>(
    `SELECT id, role::text AS role FROM users WHERE id = $1`,
    [userId]
  );
  if (!target.rows[0]) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  // Prevent removing the last admin (including self-demote)
  if (
    target.rows[0].role === "ADMIN" &&
    parsed.data.role === "USER"
  ) {
    const admins = await query<{ c: string }>(
      `SELECT COUNT(*)::text AS c FROM users WHERE role = 'ADMIN'`
    );
    if (Number(admins.rows[0]?.c ?? 0) <= 1) {
      return NextResponse.json(
        { error: "Cannot demote the last admin" },
        { status: 400 }
      );
    }
  }

  const { rows } = await query(
    `UPDATE users
     SET role = $1::user_role, updated_at = NOW()
     WHERE id = $2
     RETURNING
       id, email, username, first_name, last_name, name,
       role::text AS role, created_at::text AS created_at`,
    [parsed.data.role, userId]
  );

  return NextResponse.json({
    user: {
      ...rows[0],
      created_at: String(rows[0].created_at).slice(0, 10),
      role: rows[0].role === "ADMIN" ? "ADMIN" : "USER",
    },
  });
}
