import { NextResponse } from "next/server";
import { query } from "@/lib/db";
import { hashPassword, hashToken } from "@/lib/auth/password";
import { resetPasswordSchema } from "@/lib/auth/schemas";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = resetPasswordSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message ?? "Invalid input" },
        { status: 400 }
      );
    }

    const tokenHash = hashToken(parsed.data.token);
    const { rows } = await query<{ id: string; user_id: string }>(
      `SELECT id, user_id
       FROM password_reset_tokens
       WHERE token_hash = $1
         AND used_at IS NULL
         AND expires_at > NOW()
       LIMIT 1`,
      [tokenHash]
    );

    const reset = rows[0];
    if (!reset) {
      return NextResponse.json(
        { error: "This reset link is invalid or has expired" },
        { status: 410 }
      );
    }

    const passwordHash = await hashPassword(parsed.data.password);

    await query(`UPDATE users SET password_hash = $1, updated_at = NOW() WHERE id = $2`, [
      passwordHash,
      reset.user_id,
    ]);
    await query(
      `UPDATE password_reset_tokens SET used_at = NOW() WHERE id = $1`,
      [reset.id]
    );

    return NextResponse.json({ ok: true, message: "Password updated. You can log in." });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to reset password";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
