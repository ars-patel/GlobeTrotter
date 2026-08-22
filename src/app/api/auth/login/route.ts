import { NextResponse } from "next/server";
import { query } from "@/lib/db";
import { verifyPassword } from "@/lib/auth/password";
import { loginSchema } from "@/lib/auth/schemas";
import {
  setAuthCookie,
  signSessionToken,
  toPublicUser,
} from "@/lib/auth/session";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = loginSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message ?? "Invalid input" },
        { status: 400 }
      );
    }

    const identifier = parsed.data.identifier.trim().toLowerCase();
    const { rows } = await query(
      `SELECT
         id, email, username, first_name, last_name, name,
         phone, home_city, home_country, additional_info,
         photo_url, language, role, created_at::text, password_hash,
         is_suspended
       FROM users
       WHERE LOWER(email) = $1 OR LOWER(username) = $1
       LIMIT 1`,
      [identifier]
    );

    const row = rows[0] as
      | (Record<string, unknown> & {
          password_hash: string;
          is_suspended: boolean;
        })
      | undefined;
    if (!row) {
      return NextResponse.json(
        { error: "Invalid username/email or password" },
        { status: 401 }
      );
    }

    const ok = await verifyPassword(parsed.data.password, row.password_hash);
    if (!ok) {
      return NextResponse.json(
        { error: "Invalid username/email or password" },
        { status: 401 }
      );
    }

    if (row.is_suspended) {
      return NextResponse.json(
        {
          error:
            "This account has been suspended. Contact support if you think this is a mistake.",
        },
        { status: 403 }
      );
    }

    const user = toPublicUser(row);
    const token = signSessionToken({ sub: user.id, email: user.email });
    const response = NextResponse.json({ user });
    setAuthCookie(response, token);
    return response;
  } catch (error) {
    const message = error instanceof Error ? error.message : "Login failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
