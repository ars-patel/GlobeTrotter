import { NextResponse } from "next/server";
import { query } from "@/lib/db";
import { createResetToken } from "@/lib/auth/password";
import { forgotPasswordSchema } from "@/lib/auth/schemas";

export const runtime = "nodejs";

/**
 * Always returns a generic success message (do not reveal whether email exists).
 * In local/dev, includes resetToken when the user exists so the flow is testable without email.
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = forgotPasswordSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message ?? "Invalid input" },
        { status: 400 }
      );
    }

    const email = parsed.data.email.trim().toLowerCase();
    const generic = {
      message:
        "If an account exists for that email, password reset instructions were sent.",
    };

    const { rows } = await query<{ id: string }>(
      `SELECT id FROM users WHERE email = $1`,
      [email]
    );
    const user = rows[0];
    if (!user) {
      return NextResponse.json(generic);
    }

    const { token, tokenHash } = createResetToken();
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    await query(
      `INSERT INTO password_reset_tokens (user_id, token_hash, expires_at)
       VALUES ($1, $2, $3)`,
      [user.id, tokenHash, expiresAt.toISOString()]
    );

    const response: Record<string, string> = { ...generic };
    if (process.env.NODE_ENV !== "production") {
      response.resetToken = token;
      response.resetPath = `/reset-password?token=${token}`;
    }

    return NextResponse.json(response);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to process request";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
