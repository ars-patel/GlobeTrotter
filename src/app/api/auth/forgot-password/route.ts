import { NextResponse } from "next/server";
import { query } from "@/lib/db";
import { createResetToken } from "@/lib/auth/password";
import { forgotPasswordSchema } from "@/lib/auth/schemas";
import { isSmtpConfigured, sendPasswordResetEmail } from "@/lib/mail";

export const runtime = "nodejs";

/**
 * Always returns a generic success message (do not reveal whether email exists).
 * Sends reset link via Nodemailer when SMTP_* env vars are configured.
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

    const { rows } = await query<{ id: string; first_name: string | null }>(
      `SELECT id, first_name FROM users WHERE email = $1`,
      [email]
    );
    const user = rows[0];
    if (!user) {
      return NextResponse.json(generic);
    }

    if (!isSmtpConfigured()) {
      return NextResponse.json(
        {
          error:
            "Email is not configured. Set SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, and SMTP_FROM in .env.",
        },
        { status: 503 }
      );
    }

    const { token, tokenHash } = createResetToken();
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    await query(
      `INSERT INTO password_reset_tokens (user_id, token_hash, expires_at)
       VALUES ($1, $2, $3)`,
      [user.id, tokenHash, expiresAt.toISOString()]
    );

    const appUrl = (
      process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"
    ).replace(/\/$/, "");
    const resetUrl = `${appUrl}/reset-password?token=${token}`;

    try {
      await sendPasswordResetEmail({
        to: email,
        resetUrl,
        firstName: user.first_name,
      });
    } catch (mailError) {
      console.error("Nodemailer send failed:", mailError);
      return NextResponse.json(
        {
          error:
            "Could not send the reset email. Check SMTP settings in .env and try again.",
        },
        { status: 502 }
      );
    }

    return NextResponse.json(generic);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to process request";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
