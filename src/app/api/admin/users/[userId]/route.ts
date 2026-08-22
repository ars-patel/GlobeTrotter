import { NextResponse } from "next/server";
import { z } from "zod";
import { query } from "@/lib/db";
import { requireAdmin } from "@/lib/auth/require-admin";

export const runtime = "nodejs";

type Ctx = { params: Promise<{ userId: string }> };

const patchSchema = z
  .object({
    role: z.enum(["USER", "ADMIN"]).optional(),
    is_suspended: z.boolean().optional(),
    suspended_reason: z.string().trim().max(500).optional().nullable(),
  })
  .refine(
    (v) => v.role !== undefined || v.is_suspended !== undefined,
    { message: "Provide role and/or is_suspended" }
  );

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

  const target = await query<{
    id: string;
    role: string;
    is_suspended: boolean;
  }>(
    `SELECT id, role::text AS role, is_suspended
     FROM users WHERE id = $1`,
    [userId]
  );
  if (!target.rows[0]) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  const row = target.rows[0];

  // Never suspend or lock yourself out as the only admin via this path
  if (userId === auth.user.id && parsed.data.is_suspended === true) {
    return NextResponse.json(
      { error: "You cannot suspend your own account" },
      { status: 400 }
    );
  }

  if (
    row.role === "ADMIN" &&
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

  if (
    row.role === "ADMIN" &&
    parsed.data.is_suspended === true
  ) {
    const activeAdmins = await query<{ c: string }>(
      `SELECT COUNT(*)::text AS c
       FROM users
       WHERE role = 'ADMIN' AND is_suspended = FALSE`
    );
    if (Number(activeAdmins.rows[0]?.c ?? 0) <= 1) {
      return NextResponse.json(
        { error: "Cannot suspend the last active admin" },
        { status: 400 }
      );
    }
  }

  const nextRole = parsed.data.role ?? row.role;
  const nextSuspended =
    parsed.data.is_suspended !== undefined
      ? parsed.data.is_suspended
      : row.is_suspended;
  const reason =
    parsed.data.suspended_reason === undefined
      ? null
      : parsed.data.suspended_reason;

  const { rows } = await query(
    `UPDATE users
     SET role = $1::user_role,
         is_suspended = $2,
         suspended_at = CASE
           WHEN $2 THEN COALESCE(suspended_at, NOW())
           ELSE NULL
         END,
         suspended_reason = CASE
           WHEN $2 THEN COALESCE($3, suspended_reason)
           ELSE NULL
         END,
         updated_at = NOW()
     WHERE id = $4
     RETURNING
       id, email, username, first_name, last_name, name,
       role::text AS role,
       is_suspended,
       suspended_at::text AS suspended_at,
       suspended_reason,
       created_at::text AS created_at`,
    [nextRole, nextSuspended, reason, userId]
  );

  return NextResponse.json({
    user: {
      ...rows[0],
      created_at: String(rows[0].created_at).slice(0, 10),
      role: rows[0].role === "ADMIN" ? "ADMIN" : "USER",
      is_suspended: Boolean(rows[0].is_suspended),
    },
  });
}

export async function DELETE(_request: Request, ctx: Ctx) {
  const auth = await requireAdmin();
  if (auth.error) return auth.error;
  const { userId } = await ctx.params;

  if (userId === auth.user.id) {
    return NextResponse.json(
      { error: "You cannot delete your own account from admin" },
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

  if (target.rows[0].role === "ADMIN") {
    const admins = await query<{ c: string }>(
      `SELECT COUNT(*)::text AS c FROM users WHERE role = 'ADMIN'`
    );
    if (Number(admins.rows[0]?.c ?? 0) <= 1) {
      return NextResponse.json(
        { error: "Cannot delete the last admin" },
        { status: 400 }
      );
    }
  }

  // Cascades remove trips, posts, bookings, etc. via FK ON DELETE CASCADE
  await query(`DELETE FROM users WHERE id = $1`, [userId]);

  return NextResponse.json({ ok: true, deletedId: userId });
}
