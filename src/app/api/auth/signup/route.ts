import { NextResponse } from "next/server";
import { query } from "@/lib/db";
import { hashPassword } from "@/lib/auth/password";
import { signupSchema } from "@/lib/auth/schemas";
import {
  setAuthCookie,
  signSessionToken,
  toPublicUser,
} from "@/lib/auth/session";

export const runtime = "nodejs";

function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

function deriveUsername(email: string, requested?: string) {
  if (requested && requested.trim()) {
    return requested.trim().toLowerCase().replace(/\s+/g, "");
  }
  const local = email.split("@")[0]?.toLowerCase().replace(/[^a-z0-9._-]/g, "") ?? "user";
  return local.slice(0, 60) || "user";
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = signupSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message ?? "Invalid input" },
        { status: 400 }
      );
    }

    const data = parsed.data;
    const email = normalizeEmail(data.email);
    let username = deriveUsername(email, data.username);

    const existingEmail = await query(`SELECT id FROM users WHERE email = $1`, [
      email,
    ]);
    if (existingEmail.rows.length > 0) {
      return NextResponse.json(
        { error: "An account with this email already exists" },
        { status: 409 }
      );
    }

    const existingUsername = await query(
      `SELECT id FROM users WHERE username = $1`,
      [username]
    );
    if (existingUsername.rows.length > 0) {
      if (data.username) {
        return NextResponse.json(
          { error: "This username is already taken" },
          { status: 409 }
        );
      }
      username = `${username}${Math.floor(Math.random() * 9000 + 1000)}`.slice(
        0,
        60
      );
    }

    const passwordHash = await hashPassword(data.password);
    const displayName = `${data.first_name} ${data.last_name}`.trim();

    const { rows } = await query(
      `INSERT INTO users (
         email, username, password_hash, name, first_name, last_name,
         phone, home_city, home_country, additional_info
       ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)
       RETURNING
         id, email, username, first_name, last_name, name,
         phone, home_city, home_country, additional_info,
         photo_url, language, role, created_at::text`,
      [
        email,
        username,
        passwordHash,
        displayName,
        data.first_name,
        data.last_name,
        data.phone ?? null,
        data.home_city ?? null,
        data.home_country ?? null,
        data.additional_info ?? null,
      ]
    );

    const user = toPublicUser(rows[0] as Record<string, unknown>);
    const token = signSessionToken({ sub: user.id, email: user.email });
    const response = NextResponse.json({ user }, { status: 201 });
    setAuthCookie(response, token);
    return response;
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to create account";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
